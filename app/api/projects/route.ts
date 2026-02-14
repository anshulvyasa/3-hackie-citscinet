import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      project_name,
      category,
      scientist,
      description,
      locations,
    } = body;

    console.log("Creating project:", body);

    // ✅ Basic Validation
    if (!project_name || !category || !scientist) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { error: "Locations must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!["Water", "Wildlife", "Air", "Plants"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // ✅ Validate coordinates inside array
    for (const loc of locations) {
      if (
        loc.latitude === undefined ||
        loc.longitude === undefined ||
        loc.latitude < -90 ||
        loc.latitude > 90 ||
        loc.longitude < -180 ||
        loc.longitude > 180
      ) {
        return NextResponse.json(
          { error: "Invalid location coordinates" },
          { status: 400 }
        );
      }
    }

    const insertData: any = {
      project_name,
        category,
        description,
        scientist_id: scientist,
        locations,
    };

    const { data, error } = await supabase
      .from("projects")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Project insert error:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Project created successfully",
        project: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}