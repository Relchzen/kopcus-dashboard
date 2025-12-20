import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { TopPage } from "@/types/analytics";

interface TopPagesTableProps {
    data?: TopPage[];
}

export function TopPagesTable({ data }: TopPagesTableProps) {
    // Fallback to mock data if no real data provided
    const mockPages: TopPage[] = [
        { path: "/", views: 1200, title: "Home" },
        { path: "/portfolio", views: 850, title: "Portfolio" },
        { path: "/contact", views: 320, title: "Contact" },
        { path: "/services", views: 210, title: "Services" },
        { path: "/about", views: 150, title: "About" },
    ];

    const pages = data && data.length > 0 ? data : mockPages;

    // Format large numbers (e.g., 1200 -> "1.2k")
    const formatViews = (views: number): string => {
        if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}k`;
        }
        return views.toString();
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pages.map((page) => (
                    <TableRow key={page.path}>
                        <TableCell className="font-medium py-2">
                            {page.path}
                        </TableCell>
                        <TableCell className="text-right py-2">
                            {formatViews(page.views)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
