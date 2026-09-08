import React from 'react';
import { Users, GraduationCap, IndianRupee, Award, ExternalLink, ShieldCheck } from 'lucide-react';

export default function NationalImpactMetrics() {
  const stats = [
    {
      icon: Users,
      value: '30 LAKH+',
      label: 'PM Vishwakarma Registrations',
      sub: 'Addressable rural artisan ecosystem'
    },
    {
      icon: GraduationCap,
      value: '24.29 LAKH',
      label: 'Beneficiaries Trained',
      sub: 'Skilled traditional workforce'
    },
    {
      icon: IndianRupee,
      value: '₹5,235.8 CR',
      label: 'Credit & Loans Approved',
      sub: 'Government subsidized capital'
    },
    {
      icon: Award,
      value: '32.90 LAKH',
      label: 'Pahchan Registered Artisans',
      sub: 'Ministry of Textiles database'
    }
  ];

  return (
    <div className="glass-panel p-5 relative overflow-hidden">
      
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--color-gold)]" />
            National Scale & Impact (Government Alignment)
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Empowering traditional craftspeople aligned with official Government of India dashboards.
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <span>Source:</span>
          <a
            href="https://dashboard.msme.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-saffron)] hover:underline flex items-center gap-0.5"
          >
            MSME Dashboard <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 4 Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-black/30 border border-[var(--border-glass)] hover:border-[var(--color-saffron)]/40 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-saffron)]/15 text-[var(--color-saffron)] flex items-center justify-center mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-xl font-extrabold text-white font-heading tracking-tight">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-gray-300 mt-0.5">{s.label}</div>
              <div className="text-[10px] text-gray-400">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Scheme Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--border-glass)] text-xs text-gray-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-300">Policy Interlock:</span>
          <span className="glass-pill px-2.5 py-0.5 text-[10px] text-orange-300">PM Vishwakarma</span>
          <span className="glass-pill px-2.5 py-0.5 text-[10px] text-blue-300">Digital India</span>
          <span className="glass-pill px-2.5 py-0.5 text-[10px] text-emerald-300">ONDC Protocol</span>
          <span className="glass-pill px-2.5 py-0.5 text-[10px] text-purple-300">BHASHINI AI</span>
          <span className="glass-pill px-2.5 py-0.5 text-[10px] text-teal-300">UN SDG 8</span>
        </div>
        <div className="text-[11px] text-gray-400">
          Eliminating 40–60% Middlemen Commissions Across 700+ Craft Clusters
        </div>
      </div>

    </div>
  );
}
