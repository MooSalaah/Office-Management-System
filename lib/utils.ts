import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} ر.س`
}

export function formatDate(date: Date | string): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "تاريخ غير صحيح"
    }

    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(dateObj)
  } catch (error) {
    return "تاريخ غير صحيح"
  }
}

export function getHijriDate(date: Date | string): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "تاريخ غير صحيح"
    }

    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj)
  } catch (error) {
    return "تاريخ غير صحيح"
  }
}

export function convertToArabicNumerals(num: number | string): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
  return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[Number.parseInt(digit)])
}

export function formatArabicNumber(num: number): string {
  return convertToArabicNumerals(num)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^05\d{8}$/
  return phoneRegex.test(phone)
}

export function formatPhone(phone: string): string {
  if (phone.startsWith("05") && phone.length === 10) {
    return phone
  }
  return phone
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
    case "مكتمل":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "in-progress":
    case "قيد التنفيذ":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "new":
    case "جديد":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "cancelled":
    case "ملغي":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
    case "عالية":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "medium":
    case "متوسطة":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "low":
    case "منخفضة":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function calculateProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0
  return Math.round((completedTasks / totalTasks) * 100)
}

export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "منذ لحظات"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `منذ ${convertToArabicNumerals(minutes)} دقيقة`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `منذ ${convertToArabicNumerals(hours)} ساعة`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `منذ ${convertToArabicNumerals(days)} يوم`
  }
}

export function isCurrentMonth(date: string): boolean {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const itemDate = new Date(date)
  return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
}

export function getCurrentMonthName(): string {
  return new Intl.DateTimeFormat("ar-SA", { month: "long" }).format(new Date())
}
