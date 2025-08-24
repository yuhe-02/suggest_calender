import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!(session as any)?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accessToken = (session as any).accessToken;
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  try {
    const calendarListResponse = await calendar.calendarList.list({
      maxResults: 250,
    });

    const calendars = calendarListResponse.data.items;
    if (!calendars) {
      return NextResponse.json({ calendars: [] });
    }

    // We only want calendars that we can read free-busy info from.
    // Filter out calendars where we are not at least a reader.
    const relevantCalendars = calendars.filter(
      (cal) =>
        cal.accessRole === "reader" ||
        cal.accessRole === "owner" ||
        cal.accessRole === "writer",
    );

    return NextResponse.json({ calendars: relevantCalendars });
  } catch (error) {
    console.error("Google Calendar List API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar list" },
      { status: 500 },
    );
  }
}
