'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { deleteExercise, getExercises } from "@/firebase/firestore";
import { ExerciseItem, mediaTypes } from "@/components/exercise/ExerciseForm";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { deleteFolder } from "@/firebase/storage";

export default function Excercises() {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();

  const [data, setData] = useState<ExerciseItem[]>([]);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const fetchExercises = async () => {
    const exercises = await getExercises();
    setData(exercises);
  }

  const onEdit = async (id: string) => {
    router.push(`/exercise/${id}`)
  }

  const onDelete = async (id: string) => {
    setDeletePostId(id);
    openModal();
  }

  const confirmDelete = async () => {
    if (deletePostId) {
      await deleteExercise(deletePostId);
      await deleteFolder(deletePostId);
      await fetchExercises();
      setDeletePostId(null);
      closeModal();
    }
  }

  const getLabel = (data: { label: string; value: string }[], value: string) => {
    const target = data.find(item => item.value === value);
    return target ? target.label : value;
  }

  const getUppercaseStr = (str: string) => {
    if (str && str.length > 0) {
      const strArr = str.split('');
      strArr[0] = strArr[0].toUpperCase();
      return strArr.join('');
    }
    return '';
  }

  useEffect(() => {
    fetchExercises();
  }, [])

  return (
    <div className="">
      <h2 className="text-2xl mb-6">Exercises</h2>
      <Table className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* Table Header */}
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Name
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-1/2"
            >
              Description
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Category
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Multimedia type
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Views
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Starts
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Completions
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Favorites
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Edit
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Delete
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="px-5 py-4 sm:px-6 text-start">
                {item.name}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {item.summDescription}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {getUppercaseStr(item.category)}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                {getLabel(mediaTypes, item.category === 'meditation' || item.category === 'move' ? item.mediaType : '')}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                0
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                0
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                0
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                0
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                <Button onClick={() => onEdit(item?.id as string)}>Edit</Button>
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                <Button onClick={() => onDelete(item?.id as string)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
          Delete exercise
        </h4>
        <div className="flex items-center justify-end w-full gap-3 mt-8">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Close
          </Button>
          <Button size="sm" onClick={confirmDelete} className="bg-red-500">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
};
