'use client'

import { useEffect, useState } from "react";

import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { addTag, deleteTag, editTag, getTags } from "@/firebase/firestore";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { checkFirebasePermissionError } from "@/firebase/errorHandler";

export interface TagItem {
  id?: string;
  name: string;
}

export default function Tags() {
  const { isOpen, openModal, closeModal } = useModal();

  const [isLoadingAdd, setIsLoadingAdd] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [data, setData] = useState<TagItem[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState<string>('');
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      const tags = await getTags();
      setData(tags);
    } catch (error) {
      checkFirebasePermissionError(error as Error)
    }
  }

  const onEditConfirm = async () => {
    try {
      if (editId && editInput.length > 0) {
        setIsLoadingEdit(true);
        await editTag(editId, editInput);
        await fetchTags();
        setEditId(null);
        setEditInput('');
        setIsLoadingEdit(false);
      }
    } catch (error) {
      checkFirebasePermissionError(error as Error)
    }
  }

  const handleAddTag = async () => {
    try {
      if (tagInput.trim().length > 0) {
        setIsLoadingAdd(true);
        await addTag(tagInput);
        await fetchTags();
        setTagInput('');
        setIsLoadingAdd(false);
      }
    } catch (error) {
      checkFirebasePermissionError(error as Error)
    }
  }

  const enableEditMode = (id: string, currentName: string) => {
    setEditId(id);
    setEditInput(currentName);
  }

  const onDelete = async (id: string) => {
    setDeleteTagId(id);
    openModal();
  }

  const confirmDelete = async () => {
    try {
      if (deleteTagId) {
        await deleteTag(deleteTagId);
        await fetchTags();
        setDeleteTagId(null);
        closeModal();
      }
    } catch (error) {
      checkFirebasePermissionError(error as Error)
    }
  }

  useEffect(() => {
    fetchTags();
  }, [])

  return (
    <div className="">
      <h2 className="text-2xl mb-6">Tags</h2>
      <div className="mb-6">
        <Label>Add tag</Label>
        <div className="flex gap-2">
          <Input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} />
          <Button size="sm" disabled={isLoadingAdd} isLoading={isLoadingAdd} onClick={handleAddTag}>Add</Button>
        </div>
      </div>
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
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 !w-[105px]"
            >
              Edit
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 !w-[105px]"
            >
              Delete
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {data?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="px-5 py-4 sm:px-6 text-start">
                {editId === item.id ? <Input type="text" value={editInput} onChange={e => setEditInput(e.target.value)} /> : item.name}
              </TableCell>
              <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                {editId === item.id ? (
                  <Button onClick={onEditConfirm} isLoading={isLoadingEdit} disabled={isLoadingEdit}>Save</Button>
                ) : (
                  <Button onClick={() => enableEditMode(item?.id as string, item.name)}>Edit</Button>
                )}
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
          Delete tag
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
    </div >
  )
};
