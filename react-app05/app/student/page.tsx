import { DataTable } from '@/components/app-dashborad/data-table'
import data from "@/components/app-dashborad/data.json"
import StudentLayout from './layout'
export default function Page() {
  
  return (
    <StudentLayout>
      <DataTable data={data} />
    </StudentLayout>
  )
}
