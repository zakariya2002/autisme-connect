'use client';

import { useState } from 'react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  availableDays: number[]; // Les jours de la semaine disponibles (0-6)
  minDate?: Date;
}

export default function Calendar({ selectedDate, onDateSelect, availableDays, minDate = new Date() }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Obtenir le premier jour du mois
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Obtenir le dernier jour du mois
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentMonth);
    const lastDay = getLastDayOfMonth(currentMonth);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Ajouter des jours vides pour aligner le premier jour
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateSelectable = (date: Date) => {
    // Vérifier si la date est dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    // Vérifier si le jour de la semaine est disponible
    const dayOfWeek = date.getDay();
    return availableDays.includes(dayOfWeek);
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === selectedDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (date: Date) => {
    if (isDateSelectable(date)) {
      const dateStr = date.toISOString().split('T')[0];
      onDateSelect(dateStr);
    }
  };

  const calendarDays = generateCalendarDays();
  const isPreviousMonthDisabled = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);
    return prevMonth < today;
  };

  return (
    <div className="bg-gradient-to-br from-white to-primary-50/30 border-2 border-primary-200 rounded-xl shadow-lg overflow-hidden">
      {/* En-tête du calendrier */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goToPreviousMonth}
            disabled={isPreviousMonthDisabled()}
            className="p-2 hover:bg-white/20 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-xl font-bold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-primary-700 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const selectable = isDateSelectable(date);
            const selected = isDateSelected(date);
            const today = isToday(date);

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={!selectable}
                className={`
                  aspect-square p-2 rounded-lg text-sm font-semibold transition-all duration-200 relative
                  ${selected
                    ? 'bg-primary-600 text-white shadow-lg scale-105 ring-4 ring-primary-200'
                    : today && selectable
                    ? 'bg-primary-100 text-primary-800 border-2 border-primary-400 hover:bg-primary-200'
                    : selectable
                    ? 'bg-white text-gray-900 border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 hover:scale-105 hover:shadow-md'
                    : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }
                `}
              >
                <span className="relative z-10">{date.getDate()}</span>
                {today && !selected && selectable && (
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Légende */}
        <div className="mt-6 pt-4 border-t-2 border-primary-100">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-primary-600 shadow-sm"></div>
              <span className="font-medium text-gray-700">Sélectionné</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-primary-100 border-2 border-primary-400"></div>
              <span className="font-medium text-gray-700">Aujourd'hui</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-white border-2 border-gray-200"></div>
              <span className="font-medium text-gray-700">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-gray-50"></div>
              <span className="font-medium text-gray-700">Non disponible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
