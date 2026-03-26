import { NextRequest, NextResponse } from "next/server";

/**
 * Mock Google Drive enrichment endpoint
 * In production, this would use the Google Drive API
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const partnerName = searchParams.get("partner");

  try {
    // Mock data for demonstration
    // In production, use googleapis to search Drive
    const mockDocuments = [
      {
        id: "doc1",
        name: `${partnerName || "Partner"} - Contract Draft.docx`,
        mimeType: "application/vnd.google-apps.document",
        modifiedTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        lastModifyingUser: "Langdon Miller",
        webViewLink: "#",
        iconLink: "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document",
      },
      {
        id: "sheet1",
        name: `${partnerName || "Partner"} - Integration Checklist.xlsx`,
        mimeType: "application/vnd.google-apps.spreadsheet",
        modifiedTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        lastModifyingUser: "Team Member",
        webViewLink: "#",
        iconLink: "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.spreadsheet",
      },
      {
        id: "pres1",
        name: `${partnerName || "Partner"} - Pitch Deck.pptx`,
        mimeType: "application/vnd.google-apps.presentation",
        modifiedTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        lastModifyingUser: "Langdon Miller",
        webViewLink: "#",
        iconLink: "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation",
      },
    ];

    // Filter by partner name if provided
    const documents = partnerName
      ? mockDocuments.filter(doc =>
          doc.name.toLowerCase().includes(partnerName.toLowerCase())
        )
      : mockDocuments;

    // Group by type
    const byType = {
      documents: documents.filter(d => d.mimeType.includes('document')),
      spreadsheets: documents.filter(d => d.mimeType.includes('spreadsheet')),
      presentations: documents.filter(d => d.mimeType.includes('presentation')),
    };

    // Recent activity
    const recentActivity = documents
      .sort((a, b) => b.modifiedTime.getTime() - a.modifiedTime.getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      totalFiles: documents.length,
      byType,
      recentActivity,
      documents,
      partnerFilter: partnerName,
      note: "This is mock data. Connect Google Drive API for real data.",
    });
  } catch (error: any) {
    console.error("Drive enrichment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enrich with Drive data" },
      { status: 500 }
    );
  }
}