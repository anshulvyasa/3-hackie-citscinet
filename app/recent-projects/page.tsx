"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";
import L from "leaflet";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";
import { Leaf, Plus } from "lucide-react";

/* ================================
   🔥 Dynamic Leaflet
================================ */

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);

/* ================================
   🧠 HARDCODED USER
================================ */

const currentUser = {
  id: "1",
  type: "scientist", // change to "normal" to test hiding button
};

/* ================================
   🧠 PROJECT DATA
================================ */

// const initialProjects = [
//   {
//     id: "1",
//     name: "River Monitoring",
//     desc: "Monitoring river water quality across multiple regions.",
//     category: "Water",
//     locations: [
//       { latitude: 28.61, longitude: 77.20 },
//       { latitude: 28.63, longitude: 77.25 },
//     ],
//   },
// ];

const initialProjects = [
  {
    id: "1",
    name: "River Monitoring",
    desc: "Monitoring river water quality across multiple regions.",
    category: "Water",
    locations: [
      { latitude: 28.61, longitude: 77.2 },
      { latitude: 28.63, longitude: 77.25 },
    ],
  },
  {
    id: "2",
    name: "Urban Wildlife Survey",
    desc: "Track wildlife sightings inside urban environments.",
    category: "Wildlife",
    locations: [
      { latitude: 28.55, longitude: 77.18 },
      { latitude: 28.59, longitude: 77.1 },
    ],
  },
  {
    id: "3",
    name: "Plant Diversity Mapping",
    desc: "Mapping plant species diversity in green zones.",
    category: "Plants",
    locations: [
      { latitude: 28.7, longitude: 77.22 },
      { latitude: 28.68, longitude: 77.3 },
    ],
  },
];
/* ================================
   🎨 COLORS
================================ */

const categoryColors: any = {
  Water: "#3b82f6",
  Wildlife: "#f59e0b",
  Air: "#8b5cf6",
  Plants: "#10b981",
};

function createCategoryIcon(category: string) {
  return L.divIcon({
    html: `<div style="
      background:${categoryColors[category]};
      width:30px;height:30px;border-radius:50%;
      border:3px solid white;color:white;
      display:flex;align-items:center;justify-content:center;font-weight:bold">
      ${category.charAt(0)}
    </div>`,
  });
}

/* ================================
   🧠 MARKERS
================================ */

function ProjectMarkers({ project }: { project: any }) {
  const map = useMap();

  useEffect(() => {
    if (!project?.locations?.length) return;

    const markers: L.Marker[] = [];

    project.locations.forEach((loc: any) => {
      const m = L.marker([loc.latitude, loc.longitude], {
        icon: createCategoryIcon(project.category),
      }).addTo(map);
      markers.push(m);
    });

    const bounds = L.latLngBounds(
      project.locations.map((l: any) => [l.latitude, l.longitude]),
    );

    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12, animate: true });

    return () => markers.forEach((m) => map.removeLayer(m));
  }, [project, map]);

  return null;
}

/* ================================
   🚀 MAIN PAGE
================================ */

export default function ProjectsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState(initialProjects[0]);

  const [categoryFilter, setCategoryFilter] = useState("all");

  /* ---------- CREATE PROJECT ---------- */

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Water",
    desc: "",
    locations: [{ latitude: "", longitude: "" }],
  });

  const addLocation = () => {
    setForm((prev) => ({
      ...prev,
      locations: [...prev.locations, { latitude: "", longitude: "" }],
    }));
  };

  const updateLocation = (index: number, key: string, value: string) => {
    const updated = [...form.locations];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, locations: updated });
  };

  const handleCreateProject = () => {
    if (!form.name || !form.locations.length) {
      toast({ title: "Error", description: "Add project name & location" });
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      name: form.name,
      desc: form.desc,
      category: form.category,
      locations: form.locations.map((l) => ({
        latitude: Number(l.latitude),
        longitude: Number(l.longitude),
      })),
    };

    setProjects((prev) => [newProject, ...prev]);
    setSelectedProject(newProject);
    setIsCreateOpen(false);

    toast({
      title: "Project Created",
      description: "Scientist project added successfully",
    });

    setForm({
      name: "",
      category: "Water",
      desc: "",
      locations: [{ latitude: "", longitude: "" }],
    });
  };

  /* ---------- FILTER ---------- */

  const filteredProjects =
    categoryFilter === "all"
      ? projects
      : projects.filter((p) => p.category === categoryFilter);

  const center = selectedProject?.locations?.[0]
    ? [
        selectedProject.locations[0].latitude,
        selectedProject.locations[0].longitude,
      ]
    : [28.61, 77.2];

  return (
    <div className="h-screen flex flex-col">
      {/* ================= HEADER ================= */}

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CitSciNet</h1>
                <p className="text-sm text-muted-foreground">
                  Scientist Research Projects
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Water">Water</SelectItem>
                  <SelectItem value="Wildlife">Wildlife</SelectItem>
                  <SelectItem value="Air">Air</SelectItem>
                  <SelectItem value="Plants">Plants</SelectItem>
                </SelectContent>
              </Select>

              {currentUser && currentUser.type === "scientist" && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= BODY ================= */}

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-4 space-y-4">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md"
                onClick={() => setSelectedProject(project)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <Badge
                      className={`${categoryColors[project.category]} text-white`}
                    >
                      {project.category}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">
                    {project.desc}
                  </p>

                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/projects/${project.id}`);
                      }}
                    >
                      View Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* MAP */}
        <div className="flex-1">
          <MapContainer
            center={center as any}
            zoom={11}
            className="h-full w-full relative z-0"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ProjectMarkers project={selectedProject} />
          </MapContainer>
        </div>
      </div>

      {/* ================= CREATE PROJECT DIALOG ================= */}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Project Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Water">Water</SelectItem>
                <SelectItem value="Wildlife">Wildlife</SelectItem>
                <SelectItem value="Air">Air</SelectItem>
                <SelectItem value="Plants">Plants</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Description"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />

            {/* LOCATIONS */}
            {form.locations.map((loc, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Latitude"
                  value={loc.latitude}
                  onChange={(e) =>
                    updateLocation(i, "latitude", e.target.value)
                  }
                />
                <Input
                  placeholder="Longitude"
                  value={loc.longitude}
                  onChange={(e) =>
                    updateLocation(i, "longitude", e.target.value)
                  }
                />
              </div>
            ))}

            <Button variant="outline" onClick={addLocation}>
              Add Another Location
            </Button>

            <Button onClick={handleCreateProject}>Submit Project</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
