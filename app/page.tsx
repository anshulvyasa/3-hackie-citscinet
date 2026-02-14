import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, MapPin, Users, Eye } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CitSciNet</h1>
                <p className="text-sm text-muted-foreground">
                  Citizen Science Platform
                </p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-5xl font-bold mb-6">
              Observe, Document, Contribute
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join a community of citizen scientists documenting environmental
              observations around the world. Your sightings help researchers
              understand and protect our natural world.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Logging Observations
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <h3 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Eye className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Observe</h4>
                <p className="text-muted-foreground">
                  Spot something interesting in nature? From wildlife to water
                  quality, every observation matters.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Document</h4>
                <p className="text-muted-foreground">
                  Log your sighting with photos, location data, and
                  descriptions. Works offline with draft saving.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold mb-2">Contribute</h4>
                <p className="text-muted-foreground">
                  Your data becomes part of a larger dataset that researchers
                  use to study environmental trends.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-3xl font-bold mb-6">
              Categories We Track
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-2xl">💧</span>
                </div>
                <h4 className="font-semibold">Water</h4>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <span className="text-2xl">🦅</span>
                </div>
                <h4 className="font-semibold">Wildlife</h4>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <span className="text-2xl">🌤️</span>
                </div>
                <h4 className="font-semibold">Air</h4>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-2xl">🌿</span>
                </div>
                <h4 className="font-semibold">Plants</h4>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4 bg-card">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>
            CitSciNet - Empowering citizen scientists to make a difference
          </p>
        </div>
      </footer>
    </div>
  );
}
