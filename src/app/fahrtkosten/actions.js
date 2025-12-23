"use server";

import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helper";
import { sendEmail } from "@/lib/email";
import { travelReportCreatedEmail } from "@/email/travelReportCreatedEmail";

const TRAVEL_KM_RATE =
  parseFloat(process.env.NEXT_PUBLIC_TRAVEL_KM_RATE) || 0.3;

export async function createTravelReport(data) {
  const session = await requireSession();

  const {
    travelDate,
    reason,
    destination,
    distance,
    teamId,
    vehicles,
    totalCost,
  } = data;

  try {
    const travelReport = await prisma.travelReport.create({
      data: {
        travelDate: new Date(travelDate),
        reason: reason || null,
        destination,
        distance: parseFloat(distance),
        teamId: parseInt(teamId),
        userId: session.user.id,
        totalCost: parseFloat(totalCost),
        status: "unpaid",
        vehicles: {
          create: vehicles.map((vehicle) => {
            const cost = vehicle.noCharge
              ? 0
              : parseFloat(vehicle.distance) * TRAVEL_KM_RATE;
            return {
              driver: vehicle.driver || null,
              distance: parseFloat(vehicle.distance),
              cost: cost,
              noCharge: vehicle.noCharge || false,
            };
          }),
        },
      },
      include: {
        vehicles: true,
        team: true,
        user: true,
      },
    });

    // Send email notification
    try {
      const emailContent = travelReportCreatedEmail(travelReport);
      await sendEmail({
        to: process.env.KASSENWART_EMAIL,
        cc: session.user?.email || undefined,
        bcc: process.env.ADMIN_EMAIL,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
      console.log("Travel report creation email sent successfully");
    } catch (emailError) {
      console.error("Error sending travel report creation email:", emailError);
      // Don't fail the entire operation if email fails
    }

    return {
      success: true,
      data: travelReport,
      message: "Fahrtkosten-Abrechnung erfolgreich erstellt",
    };
  } catch (error) {
    console.error("Error creating travel report:", error);
    return {
      success: false,
      message: error.message || "Fehler beim Erstellen der Abrechnung",
    };
  }
}

export async function getTravelReports(session) {
  const { hasRole } = await import("@/lib/roles");

  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  const travelReports = await prisma.travelReport.findMany({
    where: isAdminOrKassenwart ? {} : { userId: session.user.id },
    include: {
      team: true,
      user: true,
      vehicles: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return travelReports;
}

export async function getTravelReportById(id) {
  const session = await requireSession();

  try {
    const travelReport = await prisma.travelReport.findUnique({
      where: { id: parseInt(id) },
      include: {
        team: true,
        user: true,
        vehicles: true,
      },
    });

    if (!travelReport) {
      return {
        success: false,
        message: "Fahrtkosten-Abrechnung nicht gefunden",
      };
    }

    // Check authorization
    if (
      travelReport.userId !== session.user.id &&
      !["admin", "kassenwart"].includes(session.user.role)
    ) {
      return {
        success: false,
        message: "Zugriff verweigert",
      };
    }

    return {
      success: true,
      data: travelReport,
    };
  } catch (error) {
    console.error("Error fetching travel report:", error);
    return {
      success: false,
      message: error.message || "Fehler beim Abrufen der Abrechnung",
    };
  }
}

export async function deleteTravelReport(id) {
  const session = await requireSession();

  try {
    const travelReport = await prisma.travelReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!travelReport) {
      return {
        success: false,
        message: "Fahrtkosten-Abrechnung nicht gefunden",
      };
    }

    // Check authorization
    if (
      travelReport.userId !== session.user.id &&
      !["admin", "kassenwart"].includes(session.user.role)
    ) {
      return {
        success: false,
        message: "Zugriff verweigert",
      };
    }

    await prisma.travelReport.delete({
      where: { id: parseInt(id) },
    });

    return {
      success: true,
      message: "Fahrtkosten-Abrechnung erfolgreich gelöscht",
    };
  } catch (error) {
    console.error("Error deleting travel report:", error);
    return {
      success: false,
      message: error.message || "Fehler beim Löschen der Abrechnung",
    };
  }
}
