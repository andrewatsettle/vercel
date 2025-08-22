
'use client'

import ExerciseForm, { ExerciseItem } from "@/components/exercise/ExerciseForm";
import { getExercise } from "@/firebase/firestore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Exercise() {
  const { id } = useParams();
  const [data, setData] = useState<ExerciseItem | null>(null);

  useEffect(() => {
    if (id) {
      getExercise(id as string).then((exercise) => {
        setData(exercise)
      })
    }
  }, [id])

  if (!data) return null;

  return <ExerciseForm data={data} />
};
