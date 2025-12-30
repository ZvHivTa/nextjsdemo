"use client"

import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import React, { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading: boolean
  // --- 新增参数 ---
  rowCount: number          // 后端返回的总记录数 (total)
  pagination: PaginationState // 当前的分页状态 { pageIndex, pageSize }
  onPaginationChange: OnChangeFn<PaginationState> // 分页改变时的回调
}

// 1. 重命名组件为 StudentDataTable
export function StudentDataTable<TData, TValue>({
  columns,
  data,
  loading,
  rowCount,
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

   const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      
      // --- 核心修改：开启服务端分页模式 ---
      manualPagination: true, // 告诉表格：不用你自己切片，我给你的数据已经是切好的
      rowCount: rowCount,     // 告诉表格：虽然我只给了你10条，但数据库里实际有 rowCount 条
      
      // --- 状态受控 ---
      state: {
        pagination,
      },
      onPaginationChange: onPaginationChange,
    })
  

  // 渲染骨架屏
  const renderSkeletons = () => {
    const skeletonRows = Array.from({ length: 5 });
    const columnCount = columns.length;
    return skeletonRows.map((_, i) => (
      <TableRow key={`skel-${i}`}>
        {Array.from({ length: columnCount }).map((_, j) => (
          <TableCell key={`skel-cell-${i}-${j}`}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div>
      {/* 列可见性 */}
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              显示/隐藏列 <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                if (column.id === "actions") return null;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 表格主体 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              renderSkeletons()
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {/* 2. 更新提示文本 */}
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无学生数据。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* 分页控制 */}
        {/* 分页控制 */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {/* 这里直接使用传入的 rowCount */}
                  共 {rowCount} 条课程 
                  (第 {pagination.pageIndex + 1} 页 / 共 {table.getPageCount()} 页)
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  下一页
                </Button>
              </div>
    </div>
  )
}