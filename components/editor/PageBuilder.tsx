"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Dynamic imports to avoid SSR issues
let EditorJS: any = null;
let Header: any = null;
let List: any = null;
let Paragraph: any = null;
let Image: any = null;
let Quote: any = null;
let Delimiter: any = null;
let Table: any = null;
let Code: any = null;
let Warning: any = null;
let Checklist: any = null;
let Embed: any = null;
let InlineCode: any = null;
let Marker: any = null;

interface OutputData {
  time?: number;
  blocks: any[];
  version?: string;
}

interface PageBuilderProps {
  value?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
}

export function PageBuilder({
  value,
  onChange,
  placeholder = "Start writing your content...",
  readOnly = false,
  minHeight = "500px",
}: PageBuilderProps) {
  const editorRef = useRef<any>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const loadEditorModules = async () => {
    try {
      // Dynamic imports
      const [
        editorModule,
        headerModule,
        listModule,
        paragraphModule,
        imageModule,
        quoteModule,
        delimiterModule,
        tableModule,
        codeModule,
        warningModule,
        checklistModule,
        embedModule,
        inlineCodeModule,
        markerModule,
      ] = await Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/header"),
        import("@editorjs/list"),
        import("@editorjs/paragraph"),
        import("@editorjs/image"),
        import("@editorjs/quote"),
        import("@editorjs/delimiter"),
        import("@editorjs/table"),
        import("@editorjs/code"),
        import("@editorjs/warning"),
        import("@editorjs/checklist"),
        import("@editorjs/embed"),
        import("@editorjs/inline-code"),
        import("@editorjs/marker"),
      ]);

      EditorJS = editorModule.default;
      Header = headerModule.default;
      List = listModule.default;
      Paragraph = paragraphModule.default;
      Image = imageModule.default;
      Quote = quoteModule.default;
      Delimiter = delimiterModule.default;
      Table = tableModule.default;
      Code = codeModule.default;
      Warning = warningModule.default;
      Checklist = checklistModule.default;
      Embed = embedModule.default;
      InlineCode = inlineCodeModule.default;
      Marker = markerModule.default;

      return true;
    } catch (err) {
      console.error("Failed to load editor modules:", err);
      setError("Failed to load editor modules. Please refresh the page.");
      return false;
    }
  };

  useEffect(() => {
    if (!mounted || !holderRef.current || isInitialized.current) return;

    const initializeEditor = async () => {
      setIsInitializing(true);
      setError(null);

      try {
        // Load modules first
        const modulesLoaded = await loadEditorModules();
        if (!modulesLoaded) {
          setIsInitializing(false);
          return;
        }

        // Create editor instance
        const editor = new EditorJS({
          holder: holderRef.current,
          placeholder,
          readOnly,
          data: value || undefined,
          minHeight: 0,
          onReady: () => {
            console.log("Editor.js is ready!");
            setIsReady(true);
            setIsInitializing(false);
            isInitialized.current = true;
          },
          onChange: async (api: any) => {
            try {
              const content = await api.saver.save();
              onChange?.(content);
            } catch (error) {
              console.error("Error saving content:", error);
            }
          },
          tools: {
            header: {
              class: Header,
              config: {
                placeholder: "Enter a header",
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2,
              },
              inlineToolbar: true,
            },
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
              config: {
                placeholder: "Start typing your text...",
              },
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: "unordered",
              },
            },
            checklist: {
              class: Checklist,
              inlineToolbar: true,
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              config: {
                quotePlaceholder: "Enter a quote",
                captionPlaceholder: "Quote's author",
              },
            },
            warning: {
              class: Warning,
              inlineToolbar: true,
              config: {
                titlePlaceholder: "Title",
                messagePlaceholder: "Message",
              },
            },
            delimiter: Delimiter,
            code: {
              class: Code,
              config: {
                placeholder: "Enter code",
              },
            },
            table: {
              class: Table,
              inlineToolbar: true,
              config: {
                rows: 2,
                cols: 3,
              },
            },
            image: {
              class: Image,
              config: {
                uploader: {
                  async uploadByFile(file: File) {
                    const { uploadMedia } = await import("@/lib/api/media");
                    try {
                      const res = await uploadMedia(file, "events");

                      return {
                        success: 1,
                        file: {
                          url: res.url,
                        },
                      };
                    } catch (error) {
                      console.error("Upload error:", error);
                      return {
                        success: 0,
                      };
                    }
                  },

                  async uploadByUrl(url: string) {
                    return {
                      success: 1,
                      file: {
                        url,
                      },
                    };
                  },
                },
              },
            },
            embed: {
              class: Embed,
              config: {
                services: {
                  youtube: true,
                  vimeo: true,
                  twitter: true,
                  instagram: true,
                  facebook: true,
                  codepen: true,
                },
              },
            },
            inlineCode: {
              class: InlineCode,
            },
            marker: {
              class: Marker,
            },
          },
        });

        editorRef.current = editor;
      } catch (err: any) {
        console.error("Error initializing editor:", err);
        setError(err.message || "Failed to initialize editor");
        setIsInitializing(false);
      }
    };

    const timer = setTimeout(() => {
      initializeEditor();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (editorRef.current && editorRef.current.destroy) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
          isInitialized.current = false;
        } catch (error) {
          console.error("Error destroying editor:", error);
        }
      }
    };
  }, [mounted]); // Remove all other dependencies to prevent re-initialization

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center border rounded-lg bg-muted/20"
        style={{ minHeight }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Preparing editor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="page-builder-wrapper relative border rounded-lg bg-background">
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading editor...</span>
          </div>
        </div>
      )}

      <div
        ref={holderRef}
        id="editorjs"
        className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-7 prose-li:text-base p-4"
        style={{ minHeight }}
      />
    </div>
  );
}
