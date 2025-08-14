"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="shine" />
        <div className="shell content">
          <h1 className="heading-xl">Rent private pools,<br/>by the hour.</h1>

          <div className="search">
            <div className="cell">
              <label>I want…</label>
              <select className="select" defaultValue="Pools">
                <option>Pools</option>
                <option>Courts</option>
                <option>Studios</option>
              </select>
            </div>
            <div className="cell">
              <label>Location</label>
              <input className="input" placeholder="Enter address"/>
            </div>
            <div className="cell">
              <label>Date</label>
              <input className="input" type="date"/>
            </div>
            <Link className="btn primary go" href="/browse">Find a Space</Link>
          </div>
        </div>
      </section>

      <section className="shell" style={{padding:"34px 0 60px"}}>
        <h2 style={{fontSize:22, fontWeight:800, marginBottom:12}}>How COOVA works</h2>
        <p style={{color:"#475569", maxWidth:720}}>
          Discover unique private spaces hosted by locals. Book by the hour, show up, and live your vibe.
        </p>
      </section>
    </main>
  );
}