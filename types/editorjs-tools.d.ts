declare module "@editorjs/checklist" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Checklist implements BlockTool {}
}

declare module "@editorjs/marker" {
  import { InlineTool } from "@editorjs/editorjs";
  export default class Marker implements InlineTool {}
}

declare module "@editorjs/embed" {
  import { BlockTool } from "@editorjs/editorjs";
  export default class Embed implements BlockTool {}
}
