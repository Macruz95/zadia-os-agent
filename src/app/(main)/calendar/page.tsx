/**
 * ZADIA OS - Calendar Page
 * Página principal de Agenda Cognitiva
 */

import { CognitiveCalendar } from '@/modules/calendar/components/CognitiveCalendar';

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-6">
      <CognitiveCalendar />
    </div>
  );
}

