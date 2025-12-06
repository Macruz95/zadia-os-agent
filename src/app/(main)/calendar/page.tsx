/**
 * ZADIA OS - Calendar Page
 * Página principal de Agenda Cognitiva
 */

import { CognitiveCalendar } from '@/modules/calendar/components/CognitiveCalendar';

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-6">
      <CognitiveCalendar />
    </div>
  );
}

