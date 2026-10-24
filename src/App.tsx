/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Discography } from './components/Discography';
import { PhilosophyAndBio } from './components/PhilosophyAndBio';
import { LiveAndCuration } from './components/LiveAndCuration';
import { PressKit } from './components/PressKit';
import { BookingAndContact } from './components/BookingAndContact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="apurba-dark relative min-h-screen overflow-x-clip bg-[#08090e] text-zinc-100 selection:bg-indigo-400/25 selection:text-white">
      {/* Ambient ethereal liquid glass aura orbs for realistic frosted glass refractions */}
      <div
        className="fixed top-[-140px] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full blur-[150px] opacity-60 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, rgba(99,102,241,0.12) 35%, rgba(139,92,246,0.08) 60%, transparent 80%)',
        }}
      />
      <div
        className="fixed top-[32%] right-[-180px] w-[750px] h-[750px] rounded-full blur-[180px] opacity-50 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.13) 0%, rgba(79,70,229,0.1) 45%, rgba(8,145,178,0.06) 70%, transparent 85%)',
        }}
      />
      <div
        className="fixed top-[65%] left-[-200px] w-[800px] h-[800px] rounded-full blur-[180px] opacity-45 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(8,145,178,0.1) 0%, rgba(79,70,229,0.08) 50%, transparent 80%)',
        }}
      />
      <div
        className="fixed bottom-[-180px] right-[10%] w-[900px] h-[700px] rounded-full blur-[170px] opacity-40 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(124,58,237,0.07) 55%, transparent 80%)',
        }}
      />

      {/* Subtle fine mesh glass grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(rgba(226, 232, 240, 0.5) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 3-Zone Frosted Glass Top Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <main id="main-content" className="pt-16">
        {/* Streamlined Luminous Hero */}
        <Hero />

        {/* Music & Discography Catalog */}
        <Discography />

        {/* Artistic Philosophy & Biography */}
        <PhilosophyAndBio />

        {/* Live Performances, DJ Sets & Rider */}
        <LiveAndCuration />

        {/* Electronic Press Kit (EPK) */}
        <PressKit />

        {/* Booking & Inquiries */}
        <BookingAndContact />
      </main>

      {/* Cohesive White Glass Footer */}
      <Footer />
    </div>
  );
}
