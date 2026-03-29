import { MealCalendar } from '@/components/meal-calendar'
import { getMealsByDateRange } from '@/queries/meals'
import { getAllRecipes } from '@/queries/recipes'

export const dynamic = 'force-dynamic'

export default async function PlanningPage() {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 1) // yesterday
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7) // 7 days ahead
  endDate.setHours(23, 59, 59, 999)

  const [meals, recipes] = await Promise.all([
    getMealsByDateRange(startDate, endDate),
    getAllRecipes(),
  ])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Meal Planning</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Plan your meals for the week
        </p>
      </div>
      <MealCalendar
        initialMeals={meals}
        recipes={recipes}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  )
}
