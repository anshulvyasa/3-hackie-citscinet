import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { validateObservationWithAI } from "@/lib/ai/validateObservation";

// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const bounds = searchParams.get("bounds");
//     const category = searchParams.get("category");

//     let query = supabase
//       .from("observations")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (category && category !== "all") {
//       query = query.eq("category", category);
//     }

//     if (bounds) {
//       const [minLat, minLng, maxLat, maxLng] = bounds.split(",").map(Number);
//       query = query
//         .gte("latitude", minLat)
//         .lte("latitude", maxLat)
//         .gte("longitude", minLng)
//         .lte("longitude", maxLng);
//     }

//     const { data, error } = await query;

//     if (error) {
//       console.error("Error fetching observations:", error);
//       return NextResponse.json(
//         { error: "Failed to fetch observations" },
//         { status: 500 },
//       );
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return NextResponse.json(
//       { error: "An unexpected error occurred" },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();

//     const {
//       sighting_name,
//       category,
//       latitude,
//       longitude,
//       description,
//       image_url,
//       user_id,
//     } = body;

//     console.log("-----------------------------------------");
//     console.log(body);

//     if (
//       !sighting_name ||
//       !category ||
//       latitude === undefined ||
//       longitude === undefined
//     ) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 },
//       );
//     }
//     if (!["Water", "Wildlife", "Air", "Plants"].includes(category)) {
//       return NextResponse.json({ error: "Invalid category" }, { status: 400 });
//     }

//     if (latitude < -90 || latitude > 90) {
//       return NextResponse.json(
//         { error: "Latitude must be between -90 and 90" },
//         { status: 400 },
//       );
//     }

//     if (longitude < -180 || longitude > 180) {
//       return NextResponse.json(
//         { error: "Longitude must be between -180 and 180" },
//         { status: 400 },
//       );
//     }

//     const location = `POINT(${longitude} ${latitude})`;
 
//     const insertData: any = {
//       sighting_name,
//       category,
//       location,
//       latitude,
//       longitude,
//       description,
//       image_url,
//     };


//     // 🧠 AI VALIDATION STEP
//     const aiResult = await validateObservationWithAI(insertData);

//     console.log("Ai Resullt is ", aiResult)

//     if (!aiResult.valid) {
//       return NextResponse.json(
//         {
//           error: aiResult.message || "Observation rejected by AI validation",
//         },
//         { status: 400 },
//       );
//     }

//     const { data, error } = await supabase
//       .from("observations")
//       .insert(insertData)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error creating observation:", error);
//       return NextResponse.json(
//         { error: "Failed to create observation" },
//         { status: 500 },
//       );
//     }

//     return NextResponse.json(data, { status: 201 });
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return NextResponse.json(
//       { error: "An unexpected error occurred" },
//       { status: 500 },
//     );
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      sighting_name,
      category,
      latitude,
      longitude,
      description,
      image_file, // 🔥 NEW (base64 or file data)
      user_id,
    } = body;

    console.log("step 1 -----------------------------")
    console.log(body)

    /* ===============================
       1️⃣ BASIC VALIDATION
    =============================== */

    if (!sighting_name || !category || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["Water", "Wildlife", "Air", "Plants"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json({ error: "Invalid latitude" }, { status: 400 });
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Invalid longitude" }, { status: 400 });
    }

    /* ===============================
       2️⃣ CLOUDINARY UPLOAD FIRST
    =============================== */

    let uploadedImageUrl: string | null = null;

    if (image_file) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const formData = new FormData();
      formData.append("file", image_file);
      formData.append("upload_preset", "citscienet");
      formData.append("folder", "citscienet/observations");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        return NextResponse.json(
          { error: uploadData.error?.message || "Cloudinary upload failed" },
          { status: 500 }
        );
      }

      uploadedImageUrl = uploadData.secure_url;
    }

    console.log("step 2 -----------------------------")
    console.log(uploadedImageUrl)

    /* ===============================
       3️⃣ AI VALIDATION (DESC + IMAGE)
    =============================== */

    const aiResult = await validateObservationWithAI({
      category,
      description,
      image_url: uploadedImageUrl || undefined,
    });

    console.log("step 3 -----------------------------")
    console.log("AI RESULT:", aiResult);

    if (!aiResult.valid) {
      return NextResponse.json(
        { error: aiResult.message || "Rejected by AI validation" },
        { status: 400 }
      );
    }

    /* ===============================
       4️⃣ INSERT INTO DB
    =============================== */

    const location = `POINT(${longitude} ${latitude})`;

    const insertData : any = {
      sighting_name,
      category,
      location,
      latitude,
      longitude,
      description,
      image_url: uploadedImageUrl,
      user_id,
    };

    const { data, error } = await supabase
      .from("observations")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json({ error: "Failed to create observation" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}