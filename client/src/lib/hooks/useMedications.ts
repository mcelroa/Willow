import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";

export const useMedications = () => {
   const queryClient = useQueryClient();

   const { data: medications = [] as Medication[], isLoading } = useQuery({
      queryKey: ["medications"],
      queryFn: () => agent.Medications.list(),
   });

   const createMedication = useMutation({
      mutationFn: (dto: SaveMedicationDto) => agent.Medications.create(dto),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["medications"] });
      },
   });

   const updateMedication = useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: SaveMedicationDto }) =>
         agent.Medications.update(id, dto),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["medications"] });
      },
   });

   const deleteMedication = useMutation({
      mutationFn: (id: string) => agent.Medications.delete(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["medications"] });
      },
   });

   return {
      medications,
      isLoading,
      createMedication,
      updateMedication,
      deleteMedication,
   };
};
