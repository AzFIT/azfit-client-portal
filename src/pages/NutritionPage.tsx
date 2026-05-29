import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Utensils,
  Search,
  Droplets,
  Pill,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Info,
} from 'lucide-react'
import {
  format,
  addDays,
  subDays,
} from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
type Gender = 'male' | 'female'
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extreme'
type Goal = 'maintain' | 'lose' | 'gain'
type FoodCategory = 'Protein' | 'Carbs' | 'Fats' | 'Vegetables' | 'Fruits' | 'Dairy' | 'Grains' | 'Snacks' | 'Beverages'
type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

interface FoodItem {
  id: number
  name: string
  category: FoodCategory
  calories: number
  protein: number
  carbs: number
  fats: number
  serving: string
}

interface MealEntry {
  id: string
  foodId: number
  quantity: number
  mealType: MealType
}

interface Supplement {
  id: string
  name: string
  dosage: string
  timing: string
  frequency: string
  taken: boolean
}

/* ═══════════════════════════════════════════
   DEMO DATA — 120 HK FOODS
   ═══════════════════════════════════════════ */
function generateFoodDatabase(): FoodItem[] {
  const foods: Omit<FoodItem, 'id'>[] = [
    // Proteins
    { name: 'Chicken Breast', category: 'Protein', calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: '100g' },
    { name: 'Salmon Fillet', category: 'Protein', calories: 208, protein: 20, carbs: 0, fats: 13, serving: '100g' },
    { name: 'Beef Sirloin', category: 'Protein', calories: 206, protein: 26, carbs: 0, fats: 11, serving: '100g' },
    { name: 'Pork Tenderloin', category: 'Protein', calories: 143, protein: 26, carbs: 0, fats: 3.5, serving: '100g' },
    { name: 'Eggs', category: 'Protein', calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: '100g' },
    { name: 'Tuna (canned)', category: 'Protein', calories: 132, protein: 28, carbs: 0, fats: 1, serving: '100g' },
    { name: 'Shrimp', category: 'Protein', calories: 99, protein: 24, carbs: 0.2, fats: 0.3, serving: '100g' },
    { name: 'Tofu (firm)', category: 'Protein', calories: 144, protein: 17, carbs: 3, fats: 7, serving: '100g' },
    { name: 'Whey Protein', category: 'Protein', calories: 120, protein: 24, carbs: 3, fats: 1, serving: '30g scoop' },
    { name: 'Turkey Breast', category: 'Protein', calories: 135, protein: 30, carbs: 0, fats: 1, serving: '100g' },
    { name: 'Cod Fish', category: 'Protein', calories: 82, protein: 18, carbs: 0, fats: 0.7, serving: '100g' },
    { name: 'Duck Breast', category: 'Protein', calories: 337, protein: 19, carbs: 0, fats: 28, serving: '100g' },
    { name: 'Chicken Thigh', category: 'Protein', calories: 226, protein: 25, carbs: 0, fats: 14, serving: '100g' },
    { name: 'Minced Pork', category: 'Protein', calories: 263, protein: 17, carbs: 0, fats: 21, serving: '100g' },

    // Carbs
    { name: 'White Rice (cooked)', category: 'Carbs', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: '100g' },
    { name: 'Brown Rice (cooked)', category: 'Carbs', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, serving: '100g' },
    { name: 'Egg Noodles', category: 'Carbs', calories: 138, protein: 4.5, carbs: 25, fats: 2.1, serving: '100g' },
    { name: 'Rice Noodles', category: 'Carbs', calories: 109, protein: 1.8, carbs: 24, fats: 0.2, serving: '100g' },
    { name: 'Udon Noodles', category: 'Carbs', calories: 124, protein: 3.5, carbs: 25, fats: 0.5, serving: '100g' },
    { name: 'Ramen Noodles', category: 'Carbs', calories: 196, protein: 5, carbs: 31, fats: 6, serving: '100g' },
    { name: 'Sweet Potato', category: 'Carbs', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: '100g' },
    { name: 'Oats', category: 'Carbs', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, serving: '100g' },
    { name: 'Congee (plain)', category: 'Carbs', calories: 33, protein: 0.8, carbs: 7, fats: 0.1, serving: '100g' },
    { name: 'Pasta (cooked)', category: 'Carbs', calories: 131, protein: 5, carbs: 25, fats: 1.1, serving: '100g' },
    { name: 'Bread (white)', category: 'Carbs', calories: 265, protein: 9, carbs: 49, fats: 3.2, serving: '100g' },
    { name: 'Whole Wheat Bread', category: 'Carbs', calories: 247, protein: 13, carbs: 41, fats: 3.4, serving: '100g' },
    { name: 'Potato', category: 'Carbs', calories: 77, protein: 2, carbs: 17, fats: 0.1, serving: '100g' },
    { name: 'Quinoa (cooked)', category: 'Carbs', calories: 120, protein: 4.4, carbs: 21, fats: 1.9, serving: '100g' },
    { name: 'Couscous (cooked)', category: 'Carbs', calories: 112, protein: 3.8, carbs: 23, fats: 0.2, serving: '100g' },

    // Fats
    { name: 'Olive Oil', category: 'Fats', calories: 884, protein: 0, carbs: 0, fats: 100, serving: '100ml' },
    { name: 'Peanut Butter', category: 'Fats', calories: 588, protein: 25, carbs: 20, fats: 50, serving: '100g' },
    { name: 'Almonds', category: 'Fats', calories: 579, protein: 21, carbs: 22, fats: 50, serving: '100g' },
    { name: 'Cashews', category: 'Fats', calories: 553, protein: 18, carbs: 30, fats: 44, serving: '100g' },
    { name: 'Walnuts', category: 'Fats', calories: 654, protein: 15, carbs: 14, fats: 65, serving: '100g' },
    { name: 'Avocado', category: 'Fats', calories: 160, protein: 2, carbs: 9, fats: 15, serving: '100g' },
    { name: 'Sesame Oil', category: 'Fats', calories: 884, protein: 0, carbs: 0, fats: 100, serving: '100ml' },
    { name: 'Peanuts', category: 'Fats', calories: 567, protein: 26, carbs: 16, fats: 49, serving: '100g' },
    { name: 'Chia Seeds', category: 'Fats', calories: 486, protein: 17, carbs: 42, fats: 31, serving: '100g' },
    { name: 'Flax Seeds', category: 'Fats', calories: 534, protein: 18, carbs: 29, fats: 42, serving: '100g' },
    { name: 'Coconut Oil', category: 'Fats', calories: 862, protein: 0, carbs: 0, fats: 100, serving: '100ml' },

    // Vegetables
    { name: 'Bok Choy', category: 'Vegetables', calories: 13, protein: 1.5, carbs: 2.2, fats: 0.2, serving: '100g' },
    { name: 'Chinese Broccoli (Gai Lan)', category: 'Vegetables', calories: 22, protein: 1.8, carbs: 3.3, fats: 0.4, serving: '100g' },
    { name: 'Choy Sum', category: 'Vegetables', calories: 20, protein: 1.5, carbs: 3, fats: 0.3, serving: '100g' },
    { name: 'Broccoli', category: 'Vegetables', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: '100g' },
    { name: 'Spinach', category: 'Vegetables', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, serving: '100g' },
    { name: 'Bell Peppers', category: 'Vegetables', calories: 31, protein: 1, carbs: 6, fats: 0.3, serving: '100g' },
    { name: 'Tomato', category: 'Vegetables', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, serving: '100g' },
    { name: 'Cucumber', category: 'Vegetables', calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, serving: '100g' },
    { name: 'Mushroom', category: 'Vegetables', calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, serving: '100g' },
    { name: 'Carrot', category: 'Vegetables', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, serving: '100g' },
    { name: 'Eggplant', category: 'Vegetables', calories: 25, protein: 1, carbs: 6, fats: 0.2, serving: '100g' },
    { name: 'Cabbage', category: 'Vegetables', calories: 25, protein: 1.3, carbs: 6, fats: 0.1, serving: '100g' },
    { name: 'Lettuce', category: 'Vegetables', calories: 15, protein: 1.4, carbs: 2.9, fats: 0.2, serving: '100g' },
    { name: 'Snow Peas', category: 'Vegetables', calories: 42, protein: 2.8, carbs: 7.6, fats: 0.2, serving: '100g' },
    { name: 'Bean Sprouts', category: 'Vegetables', calories: 30, protein: 3, carbs: 6, fats: 0.2, serving: '100g' },
    { name: 'Water Spinach (Kong Xin Cai)', category: 'Vegetables', calories: 19, protein: 2.6, carbs: 3.2, fats: 0.2, serving: '100g' },

    // Fruits
    { name: 'Apple', category: 'Fruits', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, serving: '100g' },
    { name: 'Banana', category: 'Fruits', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: '100g' },
    { name: 'Orange', category: 'Fruits', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, serving: '100g' },
    { name: 'Mango', category: 'Fruits', calories: 60, protein: 0.8, carbs: 15, fats: 0.4, serving: '100g' },
    { name: 'Dragon Fruit', category: 'Fruits', calories: 57, protein: 1.1, carbs: 13, fats: 0.4, serving: '100g' },
    { name: 'Papaya', category: 'Fruits', calories: 43, protein: 0.5, carbs: 11, fats: 0.3, serving: '100g' },
    { name: 'Watermelon', category: 'Fruits', calories: 30, protein: 0.6, carbs: 8, fats: 0.2, serving: '100g' },
    { name: 'Grapes', category: 'Fruits', calories: 69, protein: 0.7, carbs: 18, fats: 0.2, serving: '100g' },
    { name: 'Strawberry', category: 'Fruits', calories: 32, protein: 0.7, carbs: 7.7, fats: 0.3, serving: '100g' },
    { name: 'Blueberry', category: 'Fruits', calories: 57, protein: 0.7, carbs: 14, fats: 0.3, serving: '100g' },
    { name: 'Kiwi', category: 'Fruits', calories: 61, protein: 1.1, carbs: 15, fats: 0.5, serving: '100g' },
    { name: 'Pear', category: 'Fruits', calories: 57, protein: 0.4, carbs: 15, fats: 0.1, serving: '100g' },

    // Dairy
    { name: 'Greek Yogurt', category: 'Dairy', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: '100g' },
    { name: 'Whole Milk', category: 'Dairy', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, serving: '100ml' },
    { name: 'Skim Milk', category: 'Dairy', calories: 34, protein: 3.4, carbs: 5, fats: 0.1, serving: '100ml' },
    { name: 'Cheddar Cheese', category: 'Dairy', calories: 402, protein: 25, carbs: 1.3, fats: 33, serving: '100g' },
    { name: 'Mozzarella', category: 'Dairy', calories: 280, protein: 28, carbs: 2.2, fats: 17, serving: '100g' },
    { name: 'Butter', category: 'Dairy', calories: 717, protein: 0.9, carbs: 0.1, fats: 81, serving: '100g' },
    { name: 'Cottage Cheese', category: 'Dairy', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, serving: '100g' },
    { name: 'HK Milk Tea', category: 'Dairy', calories: 65, protein: 1.5, carbs: 10, fats: 2.3, serving: '100ml' },

    // Grains
    { name: 'Plain Congee', category: 'Grains', calories: 33, protein: 0.8, carbs: 7, fats: 0.1, serving: '100g' },
    { name: 'Century Egg Congee', category: 'Grains', calories: 52, protein: 2.5, carbs: 8, fats: 1, serving: '100g' },
    { name: 'Pork & Preserved Egg Congee', category: 'Grains', calories: 78, protein: 4, carbs: 10, fats: 2.5, serving: '100g' },
    { name: 'Steamed Bun (Mantou)', category: 'Grains', calories: 223, protein: 6.5, carbs: 46, fats: 0.8, serving: '100g' },
    { name: 'Char Siu Bun', category: 'Grains', calories: 260, protein: 8, carbs: 42, fats: 7, serving: '100g' },
    { name: 'Turnip Cake (Lo Bak Go)', category: 'Grains', calories: 145, protein: 3, carbs: 22, fats: 5, serving: '100g' },
    { name: 'Rice Roll (Cheung Fun)', category: 'Grains', calories: 85, protein: 1.5, carbs: 18, fats: 0.5, serving: '100g' },
    { name: 'Toast (HK Style)', category: 'Grains', calories: 264, protein: 8, carbs: 49, fats: 3.5, serving: '100g' },
    { name: 'Pineapple Bun', category: 'Grains', calories: 320, protein: 6, carbs: 52, fats: 10, serving: '100g' },
    { name: 'Egg Tart', category: 'Grains', calories: 288, protein: 5, carbs: 30, fats: 17, serving: '100g' },

    // Snacks
    { name: 'Siu Mai (Dim Sum)', category: 'Snacks', calories: 185, protein: 8, carbs: 20, fats: 8, serving: '100g' },
    { name: 'Har Gow (Shrimp Dumpling)', category: 'Snacks', calories: 160, protein: 10, carbs: 18, fats: 5, serving: '100g' },
    { name: 'Spring Roll', category: 'Snacks', calories: 250, protein: 5, carbs: 28, fats: 14, serving: '100g' },
    { name: 'Fish Balls', category: 'Snacks', calories: 112, protein: 13, carbs: 7, fats: 3.5, serving: '100g' },
    { name: 'Curry Fish Balls', category: 'Snacks', calories: 145, protein: 12, carbs: 10, fats: 6, serving: '100g' },
    { name: 'Jerky (Bak Kwa)', category: 'Snacks', calories: 370, protein: 20, carbs: 45, fats: 12, serving: '100g' },
    { name: 'Seaweed Snack', category: 'Snacks', calories: 35, protein: 2.5, carbs: 3, fats: 1.5, serving: '100g' },
    { name: 'Rice Crackers', category: 'Snacks', calories: 392, protein: 7, carbs: 82, fats: 2.5, serving: '100g' },
    { name: 'Mixed Nuts', category: 'Snacks', calories: 607, protein: 20, carbs: 21, fats: 54, serving: '100g' },
    { name: 'Protein Bar', category: 'Snacks', calories: 250, protein: 20, carbs: 25, fats: 8, serving: '60g' },

    // Beverages
    { name: 'Black Coffee', category: 'Beverages', calories: 2, protein: 0.1, carbs: 0, fats: 0, serving: '100ml' },
    { name: 'Yuan Yang (Coffee+Tea)', category: 'Beverages', calories: 55, protein: 1.5, carbs: 8, fats: 1.8, serving: '100ml' },
    { name: 'Lemon Tea', category: 'Beverages', calories: 35, protein: 0, carbs: 8.5, fats: 0, serving: '100ml' },
    { name: 'Red Bean Soup', category: 'Beverages', calories: 85, protein: 3, carbs: 16, fats: 0.5, serving: '100ml' },
    { name: 'Green Tea', category: 'Beverages', calories: 1, protein: 0, carbs: 0.2, fats: 0, serving: '100ml' },
    { name: 'Coconut Water', category: 'Beverages', calories: 19, protein: 0.7, carbs: 3.7, fats: 0.2, serving: '100ml' },
    { name: 'Protein Shake', category: 'Beverages', calories: 160, protein: 25, carbs: 8, fats: 2, serving: '300ml' },
  ]

  return foods.map((f, i) => ({ ...f, id: i + 1 }))
}

const FOOD_DB = generateFoodDatabase()

const CATEGORY_COLORS: Record<FoodCategory, string> = {
  Protein: '#00AEEF',
  Carbs: '#8B5CF6',
  Fats: '#F97316',
  Vegetables: '#22C55E',
  Fruits: '#EC4899',
  Dairy: '#3B82F6',
  Grains: '#EAB308',
  Snacks: '#F97316',
  Beverages: '#06B6D4',
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { label: string; value: number }> = {
  sedentary: { label: 'Sedentary', value: 1.2 },
  light: { label: 'Lightly Active', value: 1.375 },
  moderate: { label: 'Moderately Active', value: 1.55 },
  active: { label: 'Very Active', value: 1.725 },
  extreme: { label: 'Extremely Active', value: 1.9 },
}

const GOAL_LABELS: Record<Goal, { label: string; adjustment: number }> = {
  maintain: { label: 'Maintain', adjustment: 0 },
  lose: { label: 'Lose Weight', adjustment: -500 },
  gain: { label: 'Gain Muscle', adjustment: 300 },
}

/* ═══════════════════════════════════════════
   MACRO RING COMPONENT
   ═══════════════════════════════════════════ */
function MacroRing({
  label,
  value,
  target,
  color,
  unit,
  delay = 0,
}: {
  label: string
  value: number
  target: number
  color: string
  unit: string
  delay?: number
}) {
  const [animated, setAnimated] = useState(false)
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (animated ? percentage / 100 : 0) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[100px] h-[100px]">
        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#2A2A2A" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[#F0F0F0] text-base font-bold font-mono">{Math.round(value)}</span>
          <span className="text-[#6B6B6B] text-[10px]">{unit}</span>
        </div>
      </div>
      <p className="text-[#A0A0A0] text-xs mt-2 font-medium">{label}</p>
      <p className="text-[#6B6B6B] text-[10px] font-mono">
        {Math.round(percentage)}% of {Math.round(target)}g
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MEAL PLANNER TAB
   ═══════════════════════════════════════════ */
function MealPlannerTab({
  meals,
  onAddFood,
  onRemoveFood,
  foodDb,
  date,
  onDateChange,
}: {
  meals: MealEntry[]
  onAddFood: (mealType: MealType, foodId: number, qty: number) => void
  onRemoveFood: (entryId: string) => void
  foodDb: FoodItem[]
  date: Date
  onDateChange: (d: Date) => void
}) {
  const [addingToMeal, setAddingToMeal] = useState<MealType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFood, setSelectedFood] = useState('')
  const [quantity, setQuantity] = useState(100)

  const mealTypes: { type: MealType; time: string; target: number }[] = [
    { type: 'Breakfast', time: '7:00 AM', target: 600 },
    { type: 'Lunch', time: '12:30 PM', target: 700 },
    { type: 'Dinner', time: '7:00 PM', target: 700 },
    { type: 'Snacks', time: '3:00 PM', target: 400 },
  ]

  const filteredFoods = useMemo(() => {
    if (!searchTerm) return []
    return foodDb.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8)
  }, [searchTerm, foodDb])

  interface MealEntryWithFood extends MealEntry {
    food: FoodItem
  }

  const getMealFoods = (type: MealType): MealEntryWithFood[] =>
    meals
      .filter((m) => m.mealType === type)
      .map((m) => {
        const food = foodDb.find((f) => f.id === m.foodId)
        return food ? { ...m, food } : null
      })
      .filter((m): m is MealEntryWithFood => m !== null)

  const getMealTotals = (type: MealType) => {
    const foods = getMealFoods(type)
    return foods.reduce(
      (acc, f) => ({
        calories: acc.calories + (f.food.calories * f.quantity) / 100,
        protein: acc.protein + (f.food.protein * f.quantity) / 100,
        carbs: acc.carbs + (f.food.carbs * f.quantity) / 100,
        fats: acc.fats + (f.food.fats * f.quantity) / 100,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  }

  const dailyTotals = useMemo(() => {
    return mealTypes.reduce(
      (acc, m) => {
        const t = getMealTotals(m.type)
        return {
          calories: acc.calories + t.calories,
          protein: acc.protein + t.protein,
          carbs: acc.carbs + t.carbs,
          fats: acc.fats + t.fats,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )
  }, [meals])

  const handleAddFood = (mealType: MealType) => {
    if (selectedFood) {
      onAddFood(mealType, parseInt(selectedFood), quantity)
      setSelectedFood('')
      setSearchTerm('')
      setQuantity(100)
      setAddingToMeal(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => onDateChange(subDays(date, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-[#F0F0F0] font-semibold text-sm min-w-[180px] text-center">
          {format(date, 'EEEE, d MMMM')}
        </h3>
        <button
          onClick={() => onDateChange(addDays(date, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onDateChange(new Date())}
          className="ml-1 px-3 py-1.5 rounded-lg text-xs text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#242424] border border-[#2A2A2A] transition-colors"
        >
          Today
        </button>
      </div>

      {/* Meal cards */}
      {mealTypes.map((mealType, idx) => {
        const foods = getMealFoods(mealType.type)
        const totals = getMealTotals(mealType.type)
        const progress = mealType.target > 0 ? Math.min((totals.calories / mealType.target) * 100, 100) : 0

        return (
          <motion.div
            key={mealType.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Utensils size={16} className="text-[#00AEEF]" />
                <h4 className="text-[#F0F0F0] font-semibold text-sm">{mealType.type}</h4>
                <span className="text-[#6B6B6B] text-xs font-mono">{mealType.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#A0A0A0] text-xs font-mono">
                  {Math.round(totals.calories)} / {mealType.target} kcal
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-[#1A1A1A] rounded-full mb-3">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    progress > 100
                      ? '#EF4444'
                      : progress > 80
                        ? '#22C55E'
                        : '#00AEEF',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              />
            </div>

            {/* Food items */}
            <div className="space-y-2 mb-3">
              <AnimatePresence>
                {foods.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between py-1.5 px-2 bg-[#1A1A1A] rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[#F0F0F0] text-xs font-medium truncate">{f.food.name}</span>
                        <span className="text-[#6B6B6B] text-[10px] font-mono flex-shrink-0">{f.quantity}g</span>
                      </div>
                      <span className="text-[#6B6B6B] text-[10px] font-mono">
                        P:{Math.round((f.food.protein * f.quantity) / 100)} C:
                        {Math.round((f.food.carbs * f.quantity) / 100)} F:
                        {Math.round((f.food.fats * f.quantity) / 100)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#A0A0A0] text-xs font-mono">
                        {Math.round((f.food.calories * f.quantity) / 100)} kcal
                      </span>
                      <button
                        onClick={() => onRemoveFood(f.id)}
                        className="text-[#6B6B6B] hover:text-[#EF4444] transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add food */}
            {addingToMeal === mealType.type ? (
              <div className="bg-[#1A1A1A] rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedFood('')
                  }}
                  className="w-full h-9 bg-[#242424] border border-[#2A2A2A] rounded-lg px-3 text-[#F0F0F0] text-xs placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF]"
                  autoFocus
                />
                {filteredFoods.length > 0 && (
                  <div className="max-h-32 overflow-auto space-y-1">
                    {filteredFoods.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setSelectedFood(String(f.id))
                          setSearchTerm(f.name)
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                          selectedFood === String(f.id)
                            ? 'bg-[rgba(0,174,239,0.15)] text-[#00AEEF]'
                            : 'text-[#A0A0A0] hover:bg-[#242424]'
                        }`}
                      >
                        <span className="font-medium">{f.name}</span>
                        <span className="text-[#6B6B6B] ml-2">{f.calories} kcal/100g</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 h-8 bg-[#242424] border border-[#2A2A2A] rounded-lg px-2 text-[#F0F0F0] text-xs focus:outline-none focus:border-[#00AEEF]"
                    min={1}
                  />
                  <span className="text-[#6B6B6B] text-xs">grams</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddFood(mealType.type)}
                    className="px-3 py-1.5 bg-[#00AEEF] hover:bg-[#009BD6] text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAddingToMeal(null)
                      setSearchTerm('')
                      setSelectedFood('')
                    }}
                    className="px-3 py-1.5 text-[#6B6B6B] hover:text-[#F0F0F0] rounded-lg text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingToMeal(mealType.type)}
                className="flex items-center gap-1 text-[#00AEEF] hover:text-[#33BFF2] text-xs font-medium transition-colors"
              >
                <Plus size={14} />
                Add Food
              </button>
            )}
          </motion.div>
        )
      })}

      {/* Daily summary bar */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span className="text-[#F0F0F0] text-sm font-semibold">Daily Totals</span>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[#6B6B6B] text-[10px]">Calories</p>
              <p className="text-[#F0F0F0] text-xs font-bold font-mono">
                {Math.round(dailyTotals.calories)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#00AEEF] text-[10px]">Protein</p>
              <p className="text-[#00AEEF] text-xs font-bold font-mono">{Math.round(dailyTotals.protein)}g</p>
            </div>
            <div className="text-center">
              <p className="text-[#8B5CF6] text-[10px]">Carbs</p>
              <p className="text-[#8B5CF6] text-xs font-bold font-mono">{Math.round(dailyTotals.carbs)}g</p>
            </div>
            <div className="text-center">
              <p className="text-[#F97316] text-[10px]">Fats</p>
              <p className="text-[#F97316] text-xs font-bold font-mono">{Math.round(dailyTotals.fats)}g</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   FOOD DATABASE TAB
   ═══════════════════════════════════════════ */
function FoodDatabaseTab({ foodDb }: { foodDb: FoodItem[] }) {
  const [search, setSearch] = useState('')
  const [activeCategories, setActiveCategories] = useState<FoodCategory[]>([])

  const categories: FoodCategory[] = [
    'Protein',
    'Carbs',
    'Fats',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Grains',
    'Snacks',
    'Beverages',
  ]

  const toggleCategory = (cat: FoodCategory) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const filtered = useMemo(() => {
    return foodDb.filter((f) => {
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = activeCategories.length === 0 || activeCategories.includes(f.category)
      return matchSearch && matchCat
    })
  }, [foodDb, search, activeCategories])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
        <input
          type="text"
          placeholder="Search 120+ foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 bg-[#141414] border border-[#2A2A2A] rounded-xl pl-10 pr-4 text-[#F0F0F0] text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#00AEEF]"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = activeCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-[rgba(0,174,239,0.15)] text-[#00AEEF] border border-[rgba(0,174,239,0.3)]'
                  : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#2A2A2A] hover:text-[#F0F0F0]'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      <p className="text-[#6B6B6B] text-xs">{filtered.length} results</p>

      {/* Food grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {filtered.map((food, idx) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#3A3A3A] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[#F0F0F0] text-sm font-semibold truncate">{food.name}</h4>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: `${CATEGORY_COLORS[food.category]}20`,
                    color: CATEGORY_COLORS[food.category],
                  }}
                >
                  {food.category}
                </span>
                <span className="text-[#6B6B6B] text-[10px]">{food.serving}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#F0F0F0] text-sm font-bold font-mono">{food.calories} kcal</span>
                <span className="text-[#6B6B6B] text-[10px] font-mono">
                  P:{food.protein} C:{food.carbs} F:{food.fats}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   WATER TRACKER TAB
   ═══════════════════════════════════════════ */
function WaterTrackerTab() {
  const [glasses, setGlasses] = useState(5)
  const targetGlasses = 8
  const mlPerGlass = 250
  const totalMl = glasses * mlPerGlass
  const targetMl = targetGlasses * mlPerGlass

  const handleGlassClick = (index: number) => {
    if (index < glasses) {
      setGlasses(index)
    } else {
      setGlasses(index + 1)
    }
  }

  const weeklyData = [
    { day: 'Mon', amount: 2000 },
    { day: 'Tue', amount: 2250 },
    { day: 'Wed', amount: 1750 },
    { day: 'Thu', amount: 2500 },
    { day: 'Fri', amount: 1500 },
    { day: 'Sat', amount: 2000 },
    { day: 'Sun', amount: totalMl },
  ]

  const ringPercentage = Math.min((totalMl / targetMl) * 100, 100)
  const circumference = 2 * Math.PI * 35
  const ringOffset = circumference - (ringPercentage / 100) * circumference

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-3">
          <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
            <circle cx="48" cy="48" r="35" fill="none" stroke="#2A2A2A" strokeWidth="6" />
            <circle
              cx="48"
              cy="48"
              r="35"
              fill="none"
              stroke="#00AEEF"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[#00AEEF] text-lg font-bold">{Math.round(ringPercentage)}%</span>
          </div>
        </div>
        <div className="text-center">
          <span className="text-[#00AEEF] text-2xl font-bold font-mono">{totalMl}</span>
          <span className="text-[#6B6B6B] text-base font-mono ml-1">/ {targetMl} ml</span>
        </div>
        <p className="text-[#A0A0A0] text-sm mt-1">
          {glasses}/{targetGlasses} glasses
        </p>
      </div>

      {/* Glasses */}
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length: targetGlasses }, (_, i) => (
          <motion.button
            key={i}
            onClick={() => handleGlassClick(i)}
            whileTap={{ scale: 0.9 }}
            className="relative flex flex-col items-center"
          >
            <div className="relative w-9 h-12">
              {/* Empty glass outline */}
              <svg width="36" height="48" viewBox="0 0 36 48">
                <path
                  d="M4 4 L8 44 Q8 46 10 46 L26 46 Q28 46 28 44 L32 4"
                  fill="none"
                  stroke="#2A2A2A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Filled portion */}
              {i < glasses && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '80%' }}
                  transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
                  className="absolute bottom-[10%] left-[13%] right-[13%] rounded-b-lg overflow-hidden"
                  style={{ background: 'rgba(0, 174, 239, 0.6)' }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: 'rgba(0, 174, 239, 0.9)' }}
                  />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick add buttons */}
      <div className="flex items-center justify-center gap-2">
        {[250, 500, 1000].map((ml) => (
          <button
            key={ml}
            onClick={() => setGlasses((g) => Math.min(g + ml / 250, 20))}
            className="px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-[#00AEEF] hover:bg-[#242424] transition-colors"
          >
            +{ml}ml
          </button>
        ))}
        <button
          onClick={() => setGlasses(0)}
          className="px-3 py-1.5 text-[#6B6B6B] hover:text-[#F0F0F0] text-xs transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Weekly chart */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-5">
        <h4 className="text-[#F0F0F0] font-semibold text-sm mb-4">This Week</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6B6B6B', fontSize: 11 }}
                axisLine={{ stroke: '#2A2A2A' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B6B6B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 3000]}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#F0F0F0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.amount >= targetMl ? '#00AEEF' : entry.amount >= 1500 ? '#8B5CF6' : '#F97316'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SUPPLEMENTS TAB
   ═══════════════════════════════════════════ */
function SupplementsTab() {
  const [supplements, setSupplements] = useState<Supplement[]>([
    { id: '1', name: 'Whey Protein', dosage: '1 scoop (30g)', timing: 'Post-workout', frequency: 'Daily', taken: true },
    { id: '2', name: 'Creatine Monohydrate', dosage: '5g', timing: 'Morning', frequency: 'Daily', taken: true },
    { id: '3', name: 'BCAAs', dosage: '10g', timing: 'Pre-workout', frequency: 'Training days', taken: false },
    { id: '4', name: 'Omega-3 Fish Oil', dosage: '2 capsules (1000mg)', timing: 'With meals', frequency: 'Daily', taken: true },
    { id: '5', name: 'Multivitamin', dosage: '1 tablet', timing: 'Morning', frequency: 'Daily', taken: true },
    { id: '6', name: 'Vitamin D3', dosage: '2000 IU', timing: 'Morning', frequency: 'Daily', taken: false },
    { id: '7', name: 'Magnesium', dosage: '400mg', timing: 'Before bed', frequency: 'Daily', taken: false },
    { id: '8', name: 'Zinc', dosage: '15mg', timing: 'Morning', frequency: 'Daily', taken: true },
  ])

  const toggleTaken = (id: string) => {
    setSupplements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, taken: !s.taken } : s))
    )
  }

  const timingOrder = ['Morning', 'Pre-workout', 'Post-workout', 'With meals', 'Evening', 'Before bed']

  const supplementsByTiming = useMemo(() => {
    const groups: Record<string, Supplement[]> = {}
    supplements.forEach((s) => {
      if (!groups[s.timing]) groups[s.timing] = []
      groups[s.timing].push(s)
    })
    return timingOrder
      .filter((t) => groups[t]?.length > 0)
      .map((t) => ({ timing: t, items: groups[t] }))
  }, [supplements])

  const takenCount = supplements.filter((s) => s.taken).length

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
        <div>
          <p className="text-[#F0F0F0] font-semibold text-sm">Today&apos;s Supplements</p>
          <p className="text-[#6B6B6B] text-xs mt-0.5">
            {takenCount}/{supplements.length} taken
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: takenCount === supplements.length ? '#22C55E' : '#00AEEF',
              }}
              animate={{ width: `${(takenCount / supplements.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[#A0A0A0] text-xs font-mono">
            {Math.round((takenCount / supplements.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {supplementsByTiming.map(({ timing, items }) => (
          <div key={timing}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00AEEF]" />
              <h4 className="text-[#00AEEF] text-xs font-semibold uppercase">{timing}</h4>
              <div className="flex-1 h-px bg-[#2A2A2A]" />
            </div>

            <div className="space-y-2 ml-4">
              {items.map((supp) => (
                <motion.div
                  key={supp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between bg-[#141414] border rounded-xl p-4 transition-colors ${
                    supp.taken ? 'border-[rgba(34,197,94,0.3)]' : 'border-[#2A2A2A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaken(supp.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        supp.taken
                          ? 'bg-[#22C55E] border-[#22C55E]'
                          : 'border-[#2A2A2A] hover:border-[#00AEEF]'
                      }`}
                    >
                      {supp.taken && <Check size={14} className="text-white" />}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${supp.taken ? 'text-[#6B6B6B] line-through' : 'text-[#F0F0F0]'}`}>
                        {supp.name}
                      </p>
                      <p className="text-[#6B6B6B] text-xs">
                        {supp.dosage} · {supp.frequency}
                      </p>
                    </div>
                  </div>
                  <Pill size={16} className={supp.taken ? 'text-[#22C55E]' : 'text-[#2A2A2A]'} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN NUTRITION PAGE
   ═══════════════════════════════════════════ */
export default function NutritionPage() {
  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState(32)
  const [weight, setWeight] = useState(78.5)
  const [height, setHeight] = useState(183)
  const [activity, setActivity] = useState<ActivityLevel>('moderate')
  const [goal, setGoal] = useState<Goal>('maintain')
  const [mealDate, setMealDate] = useState(new Date())
  const [meals, setMeals] = useState<MealEntry[]>([
    // Breakfast demo items
    { id: 'm1', foodId: 1, quantity: 80, mealType: 'Breakfast' },
    { id: 'm2', foodId: 5, quantity: 120, mealType: 'Breakfast' },
    { id: 'm3', foodId: 86, quantity: 250, mealType: 'Breakfast' },
    // Lunch
    { id: 'm4', foodId: 1, quantity: 150, mealType: 'Lunch' },
    { id: 'm5', foodId: 15, quantity: 150, mealType: 'Lunch' },
    { id: 'm6', foodId: 31, quantity: 200, mealType: 'Lunch' },
    // Dinner
    { id: 'm7', foodId: 2, quantity: 150, mealType: 'Dinner' },
    { id: 'm8', foodId: 17, quantity: 200, mealType: 'Dinner' },
    { id: 'm9', foodId: 30, quantity: 150, mealType: 'Dinner' },
    // Snacks
    { id: 'm10', foodId: 47, quantity: 200, mealType: 'Snacks' },
    { id: 'm11', foodId: 55, quantity: 100, mealType: 'Snacks' },
    { id: 'm12', foodId: 39, quantity: 30, mealType: 'Snacks' },
  ])

  /* ─── TDEE Calculation (Mifflin-St Jeor) ─── */
  const bmr = useMemo(() => {
    // Mifflin-St Jeor: 10*weight + 6.25*height - 5*age + 5 (male) / -161 (female)
    const base = 10 * weight + 6.25 * height - 5 * age
    return gender === 'male' ? base + 5 : base - 161
  }, [gender, age, weight, height])

  const tdee = useMemo(() => {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity].value)
  }, [bmr, activity])

  const targetCalories = useMemo(() => {
    return tdee + GOAL_LABELS[goal].adjustment
  }, [tdee, goal])

  // Macro targets (based on typical bodybuilding ratios)
  const proteinTarget = Math.round(weight * 2) // 2g per kg
  const fatTarget = Math.round((targetCalories * 0.25) / 9) // 25% of calories
  const carbTarget = Math.round((targetCalories - proteinTarget * 4 - fatTarget * 9) / 4)

  // Calculate current macros from meals
  const currentMacros = useMemo(() => {
    return meals.reduce(
      (acc, m) => {
        const food = FOOD_DB.find((f) => f.id === m.foodId)
        if (!food) return acc
        const ratio = m.quantity / 100
        return {
          protein: acc.protein + food.protein * ratio,
          carbs: acc.carbs + food.carbs * ratio,
          fats: acc.fats + food.fats * ratio,
        }
      },
      { protein: 0, carbs: 0, fats: 0 }
    )
  }, [meals])

  const handleAddFood = useCallback((mealType: MealType, foodId: number, qty: number) => {
    setMeals((prev) => [
      ...prev,
      { id: `m-${Date.now()}`, foodId, quantity: qty, mealType },
    ])
  }, [])

  const handleRemoveFood = useCallback((entryId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== entryId))
  }, [])

  // Adherence data
  const adherenceData = [
    { day: 'Mon', adherence: 92 },
    { day: 'Tue', adherence: 98 },
    { day: 'Wed', adherence: 85 },
    { day: 'Thu', adherence: 90 },
    { day: 'Fri', adherence: 88 },
    { day: 'Sat', adherence: 62 },
    { day: 'Sun', adherence: 75 },
  ]

  const avgAdherence = Math.round(adherenceData.reduce((s, d) => s + d.adherence, 0) / adherenceData.length)

  const getBarColor = (val: number) => {
    if (val >= 90) return '#22C55E'
    if (val >= 70) return '#EAB308'
    return '#EF4444'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ═══ TDEE Summary + Macro Rings ═══ */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* TDEE Calculation Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="xl:w-[45%] space-y-4"
          >
            <h3 className="text-[#F0F0F0] font-semibold text-base">Daily Energy Target</h3>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Gender */}
              <div className="flex items-center gap-1 bg-[#1A1A1A] rounded-lg p-1 border border-[#2A2A2A]">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    gender === 'male' ? 'bg-[#00AEEF] text-white' : 'text-[#6B6B6B] hover:text-[#A0A0A0]'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                    gender === 'female' ? 'bg-[#EC4899] text-white' : 'text-[#6B6B6B] hover:text-[#A0A0A0]'
                  }`}
                >
                  Female
                </button>
              </div>
              {/* Age */}
              <div className="flex items-center bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] px-3">
                <span className="text-[#6B6B6B] text-[10px] mr-2">Age</span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-transparent text-[#F0F0F0] text-xs text-right focus:outline-none"
                  min={10}
                  max={100}
                />
              </div>
              {/* Weight */}
              <div className="flex items-center bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] px-3">
                <span className="text-[#6B6B6B] text-[10px] mr-2">Weight (kg)</span>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-transparent text-[#F0F0F0] text-xs text-right focus:outline-none"
                  min={20}
                  max={300}
                  step={0.1}
                />
              </div>
              {/* Height */}
              <div className="flex items-center bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] px-3">
                <span className="text-[#6B6B6B] text-[10px] mr-2">Height (cm)</span>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-transparent text-[#F0F0F0] text-xs text-right focus:outline-none"
                  min={50}
                  max={300}
                />
              </div>
            </div>

            {/* Activity Level */}
            <Select value={activity} onValueChange={(v) => setActivity(v as ActivityLevel)}>
              <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F0F0F0] text-xs h-9">
                <SelectValue placeholder="Activity Level" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                {(Object.entries(ACTIVITY_MULTIPLIERS) as [ActivityLevel, { label: string; value: number }][]).map(
                  ([key, { label }]) => (
                    <SelectItem key={key} value={key} className="text-[#F0F0F0]">
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {/* Goal Toggle */}
            <div className="flex items-center gap-1 bg-[#1A1A1A] rounded-lg p-1 border border-[#2A2A2A]">
              {(Object.entries(GOAL_LABELS) as [Goal, { label: string; adjustment: number }][]).map(
                ([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setGoal(key)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                      goal === key
                        ? key === 'lose'
                          ? 'bg-[#EF4444] text-white'
                          : key === 'gain'
                            ? 'bg-[#22C55E] text-white'
                            : 'bg-[#00AEEF] text-white'
                        : 'text-[#6B6B6B] hover:text-[#A0A0A0]'
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>

            {/* TDEE Display */}
            <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#00AEEF] text-3xl font-bold font-mono">{targetCalories.toLocaleString()} kcal</span>
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B] text-xs">BMR</span>
                  <span className="text-[#A0A0A0] text-xs font-mono">{Math.round(bmr)} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B] text-xs">Activity</span>
                  <span className="text-[#A0A0A0] text-xs font-mono">
                    × {ACTIVITY_MULTIPLIERS[activity].value} ({ACTIVITY_MULTIPLIERS[activity].label})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B] text-xs">TDEE</span>
                  <span className="text-[#A0A0A0] text-xs font-mono">{tdee} kcal</span>
                </div>
                {GOAL_LABELS[goal].adjustment !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B] text-xs">Goal Adjust</span>
                    <span
                      className={`text-xs font-mono ${
                        GOAL_LABELS[goal].adjustment > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                      }`}
                    >
                      {GOAL_LABELS[goal].adjustment > 0 ? '+' : ''}
                      {GOAL_LABELS[goal].adjustment} kcal
                    </span>
                  </div>
                )}
              </div>
              {/* Formula */}
              <div className="pt-2 border-t border-[#2A2A2A]">
                <p className="text-[#3A3A3A] text-[10px] font-mono">
                  {gender === 'male' ? '10' : '10'} × {weight}kg + 6.25 × {height}cm − 5 × {age}{' '}
                  {gender === 'male' ? '+ 5' : '− 161'} = {Math.round(bmr)} kcal
                </p>
              </div>
            </div>
          </motion.div>

          {/* Macro Rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="xl:w-[55%] flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-8 sm:gap-12">
                <MacroRing
                  label="Protein"
                  value={currentMacros.protein}
                  target={proteinTarget}
                  color="#00AEEF"
                  unit="g"
                  delay={0}
                />
                <MacroRing
                  label="Carbs"
                  value={currentMacros.carbs}
                  target={carbTarget}
                  color="#8B5CF6"
                  unit="g"
                  delay={150}
                />
                <MacroRing
                  label="Fats"
                  value={currentMacros.fats}
                  target={fatTarget}
                  color="#F97316"
                  unit="g"
                  delay={300}
                />
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-[#00AEEF] text-xs font-bold">{Math.round((proteinTarget * 4 / targetCalories) * 100)}%</p>
                  <p className="text-[#6B6B6B] text-[10px]">Protein</p>
                  <p className="text-[#3A3A3A] text-[10px] font-mono">{proteinTarget * 4} kcal</p>
                </div>
                <div>
                  <p className="text-[#8B5CF6] text-xs font-bold">{Math.round((carbTarget * 4 / targetCalories) * 100)}%</p>
                  <p className="text-[#6B6B6B] text-[10px]">Carbs</p>
                  <p className="text-[#3A3A3A] text-[10px] font-mono">{carbTarget * 4} kcal</p>
                </div>
                <div>
                  <p className="text-[#F97316] text-xs font-bold">{Math.round((fatTarget * 9 / targetCalories) * 100)}%</p>
                  <p className="text-[#6B6B6B] text-[10px]">Fats</p>
                  <p className="text-[#3A3A3A] text-[10px] font-mono">{fatTarget * 9} kcal</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══ Tabs ═══ */}
      <Tabs defaultValue="planner" className="w-full">
        <TabsList className="bg-[#141414] border border-[#2A2A2A] p-1 rounded-xl w-full justify-start gap-1">
          <TabsTrigger
            value="planner"
            className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#F0F0F0] data-[state=active]:border-[#2A2A2A] data-[state=active]:border text-[#6B6B6B] text-xs rounded-lg px-4 py-2 transition-all"
          >
            <Utensils size={14} className="mr-1.5" />
            Meal Planner
          </TabsTrigger>
          <TabsTrigger
            value="database"
            className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#F0F0F0] data-[state=active]:border-[#2A2A2A] data-[state=active]:border text-[#6B6B6B] text-xs rounded-lg px-4 py-2 transition-all"
          >
            <Search size={14} className="mr-1.5" />
            Food DB
          </TabsTrigger>
          <TabsTrigger
            value="water"
            className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#F0F0F0] data-[state=active]:border-[#2A2A2A] data-[state=active]:border text-[#6B6B6B] text-xs rounded-lg px-4 py-2 transition-all"
          >
            <Droplets size={14} className="mr-1.5" />
            Water
          </TabsTrigger>
          <TabsTrigger
            value="supplements"
            className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-[#F0F0F0] data-[state=active]:border-[#2A2A2A] data-[state=active]:border text-[#6B6B6B] text-xs rounded-lg px-4 py-2 transition-all"
          >
            <Pill size={14} className="mr-1.5" />
            Supplements
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="planner" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MealPlannerTab
                meals={meals}
                onAddFood={handleAddFood}
                onRemoveFood={handleRemoveFood}
                foodDb={FOOD_DB}
                date={mealDate}
                onDateChange={setMealDate}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="database" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FoodDatabaseTab foodDb={FOOD_DB} />
            </motion.div>
          </TabsContent>

          <TabsContent value="water" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <WaterTrackerTab />
            </motion.div>
          </TabsContent>

          <TabsContent value="supplements" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SupplementsTab />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* ═══ Weekly Adherence Section ═══ */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-[#00AEEF]" />
          <h3 className="text-[#F0F0F0] font-semibold text-base">This Week&apos;s Adherence</h3>
        </div>

        <div className="h-40 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adherenceData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6B6B6B', fontSize: 11 }}
                axisLine={{ stroke: '#2A2A2A' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6B6B6B', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  color: '#F0F0F0',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Adherence']}
              />
              <Bar dataKey="adherence" radius={[6, 6, 0, 0]}>
                {adherenceData.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.adherence)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-[#6B6B6B] text-xs">Weekly Average</span>
            <p className={`font-bold font-mono ${getBarColor(avgAdherence)}`} style={{ color: getBarColor(avgAdherence) }}>
              {avgAdherence}%
            </p>
          </div>
          <div>
            <span className="text-[#6B6B6B] text-xs">Best Day</span>
            <p className="text-[#22C55E] font-medium text-xs">
              Tuesday — 98%
            </p>
          </div>
          <div>
            <span className="text-[#6B6B6B] text-xs">Needs Improvement</span>
            <p className="text-[#EAB308] font-medium text-xs">
              Saturday — 62%
            </p>
          </div>
          <div>
            <span className="text-[#6B6B6B] text-xs">Calorie Avg</span>
            <p className="text-[#A0A0A0] font-mono text-xs">
              2,280 / {targetCalories.toLocaleString()} kcal
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
