"use client";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import TrainerListDropdown from "./trainerListDropdown";
import TrainerDeleteDialog from "./trainerDeleteDialog";
import TrainerNewDialog from "./trainerNewDialog";
import TrainerEditDialog from "./trainerEditDialog";
import {
  getTrainerLicenseLabel,
  getTrainerHourlyRate,
} from "@/lib/trainerentgelte";
import { hasRole } from "@/lib/roles";

function TrainerTable({ trainers, session }) {
  const router = useRouter();
  const [deleteDialogState, setDeleteDialogState] = useState({
    open: false,
    trainer: null,
  });
  const [editDialogState, setEditDialogState] = useState({
    open: false,
    trainer: null,
  });
  const [newDialogOpen, setNewDialogOpen] = useState(false);

  const isAdminOrKassenwart =
    hasRole(session, "admin") || hasRole(session, "kassenwart");

  const openDeleteDialog = (trainer) =>
    setDeleteDialogState({ open: true, trainer });
  const closeDeleteDialog = () =>
    setDeleteDialogState({ open: false, trainer: null });

  const openEditDialog = (trainer) =>
    setEditDialogState({ open: true, trainer });
  const closeEditDialog = () =>
    setEditDialogState({ open: false, trainer: null });

  return (
    <>
      <div className="w-full flex flex-row gap-6 justify-between">
        <InputGroup className="max-w-sm">
          <InputGroupInput placeholder="Suche..." />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="secondary">Suche</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Button
          disabled={!isAdminOrKassenwart}
          variant="success"
          onClick={() => setNewDialogOpen(true)}
        >
          <PlusIcon /> Neuer Trainer
        </Button>
      </div>
      <Table>
        <TableCaption>Alle Abrechnungen - Update 14.10.2025</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Trainer</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead>Stammverein</TableHead>
            {isAdminOrKassenwart && <TableHead>Lizenz</TableHead>}
            {isAdminOrKassenwart && <TableHead>€/h</TableHead>}
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainers.map((trainer) => (
            <TableRow key={trainer.id}>
              <TableCell className="font-medium">{trainer.id}</TableCell>
              <TableCell className="font-medium">{trainer.name}</TableCell>
              <TableCell>
                {trainer.trainerTeams?.map((tt) => tt.team.name).join(", ") ||
                  "-"}
              </TableCell>
              <TableCell>{trainer.stammverein || "-"}</TableCell>
              {isAdminOrKassenwart && (
                <TableCell>
                  {getTrainerLicenseLabel(trainer.licenseType)}
                </TableCell>
              )}
              {isAdminOrKassenwart && (
                <TableCell>
                  {trainer.licenseType
                    ? `${getTrainerHourlyRate(trainer.licenseType).toFixed(
                        2
                      )} €`
                    : "-"}
                </TableCell>
              )}
              <TableCell className="text-right">
                {isAdminOrKassenwart && (
                  <TrainerListDropdown
                    onDeleteClick={() => openDeleteDialog(trainer)}
                    onEditClick={() => openEditDialog(trainer)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TrainerDeleteDialog
        open={deleteDialogState.open}
        trainer={deleteDialogState.trainer}
        onClose={() => {
          setDeleteDialogState({ open: false, trainer: null });
          // ✅ refresh nach erfolgreichem Delete
          router.refresh();
        }}
      />
      <TrainerEditDialog
        open={editDialogState.open}
        trainer={editDialogState.trainer}
        onClose={() => {
          setEditDialogState({ open: false, trainer: null });
          router.refresh();
        }}
      />
      <TrainerNewDialog
        open={newDialogOpen}
        onClose={() => {
          setNewDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

export default TrainerTable;
