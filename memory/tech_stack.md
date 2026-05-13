---
name: tech-stack
description: Batumen Fashion frontend tech stack - Next.js 16, Tailwind v4, Zustand, Axios
metadata:
  type: project
---

## Frontend Stack (2026-05-13)

- **Framework:** Next.js 16.2.6 (App Router) - plan Next.js 14 diyordu ama latest kuruldu
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 (@theme direktifi kullanılıyor, tailwind.config.js yok)
- **State:** Zustand + persist middleware
- **API:** Axios class-based client (src/lib/api.ts)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Heroicons v2
- **Images:** Next.js Image component

**Why:** create-next-app@latest Next.js 16 kurdu, Tailwind v4 önemli fark: @theme {} direktifi ile CSS dosyasında tema tanımlanıyor, tailwind.config.js gerekmiyor.

**How to apply:** Tailwind sınıfları normal çalışıyor. Özel renkler globals.css @theme bloğunda tanımlı. Server component'lerde event handler kullanılmıyor (form event handler'lar için 'use client' gerekli).
