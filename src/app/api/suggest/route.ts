import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";

// Function to find available slots
function findAvailableSlots(
  busySlots: any[],
  timeMin: string,
  timeMax: string,
  durationMinutes: number,
) {
  const busyTimes = busySlots
    .map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const availableSlots = [];
  let checkTime = new Date(timeMin);

  // Set working hours (e.g., 9 AM to 5 PM in the local timezone of the server)
  const workingHoursStart = 9;
  const workingHoursEnd = 17;

  while (checkTime < new Date(timeMax)) {
    // Move to the start of working hours for the current day
    if (checkTime.getHours() < workingHoursStart) {
      checkTime.setHours(workingHoursStart, 0, 0, 0);
    }

    const dayEndTime = new Date(checkTime);
    dayEndTime.setHours(workingHoursEnd, 0, 0, 0);

    // Find the next busy slot that affects our current checkTime
    const nextBusySlot = busyTimes.find(
      (slot) => slot.start < dayEndTime && slot.end > checkTime,
    );

    let freeUntil;
    if (nextBusySlot) {
      freeUntil = nextBusySlot.start;
    } else {
      freeUntil = dayEndTime;
    }

    // Check if there is enough time for the meeting
    if (
      freeUntil.getTime() - checkTime.getTime() >=
      durationMinutes * 60 * 1000
    ) {
      availableSlots.push(new Date(checkTime));
    }

    // Move checkTime to the end of the current free block or busy slot
    checkTime = nextBusySlot ? nextBusySlot.end : dayEndTime;

    // If we've reached the end of the working day, move to the start of the next day
    if (checkTime.getTime() >= dayEndTime.getTime()) {
      checkTime.setDate(checkTime.getDate() + 1);
      checkTime.setHours(workingHoursStart, 0, 0, 0);
    }
  }

  return availableSlots;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!(session as any)?.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated or access token is missing" },
      { status: 401 },
    );
  }

  const { attendees, startDate, endDate, duration } = await request.json();
  const accessToken = (session as any).accessToken;

  const allAttendees = [
    session.user?.email,
    ...attendees.split(",").filter(Boolean),
  ];
  const calendarItems = allAttendees.map((email) => ({ id: email }));

  const timeMin = `${startDate}T00:00:00+09:00`; // JST
  const timeMax = `${endDate}T23:59:59+09:00`; // JST

  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  try {
    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: "Asia/Tokyo",
        items: calendarItems,
      },
    });
    // console.log('FreeBusy Response:', freeBusyResponse.data.calendars);
    console.log(JSON.stringify(freeBusyResponse.data, null, 2));

    const calendars = freeBusyResponse.data.calendars;
    if (!calendars) {
      return NextResponse.json({ suggestions: [] });
    }

    const allBusySlots = Object.values(calendars).flatMap(
      (cal) => cal.busy || [],
    );

    const mergedBusySlots = allBusySlots
      .reduce((acc: any[], slot) => {
        const lastSlot = acc[acc.length - 1];
        if (lastSlot && new Date(slot.start) < new Date(lastSlot.end)) {
          if (new Date(slot.end) > new Date(lastSlot.end)) {
            lastSlot.end = slot.end;
          }
        } else {
          acc.push({ start: slot.start, end: slot.end });
        }
        return acc;
      }, [])
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

    const availableSlots = findAvailableSlots(
      mergedBusySlots,
      timeMin,
      timeMax,
      duration,
    );

    const formattedSlots = availableSlots.map((slot) =>
      slot.toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" }),
    );

    return NextResponse.json({
      suggestions: formattedSlots,
      calendarData: calendars,
    });
  } catch (error) {
    console.error("Google Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar data" },
      { status: 500 },
    );
  }
}
