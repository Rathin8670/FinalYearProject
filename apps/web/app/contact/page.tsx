'use client';

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-32 pb-16 px-6 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-8">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-12">
            Have a project in mind? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">Get in touch</h2>
              <div className="space-y-4">
                <p>Email: hello@carepulse.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Innovation Drive, Tech City, TC 90210</p>
              </div>
            </div>
            
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input type="text" id="name" className="w-full p-3 rounded-lg border bg-muted" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input type="email" id="email" className="w-full p-3 rounded-lg border bg-muted" placeholder="your@email.com" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea id="message" rows={5} className="w-full p-3 rounded-lg border bg-muted" placeholder="Tell us about your project"></textarea>
              </div>
              <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
