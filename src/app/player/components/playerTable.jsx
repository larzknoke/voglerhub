"use client";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
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
import PlayerListDropdown from "./playerListDropdown";
import PlayerDeleteDialog from "./playerDeleteDialog";
import PlayerNewDialog from "./playerNewDialog";
import PlayerEditDialog from "./playerEditDialog";

function PlayerTable({ players, teams }) {
  const router = useRouter();
  const [deleteDialogState, setDeleteDialogState] = useState({
    open: false,
    player: null,
  });
  const [editDialogState, setEditDialogState] = useState({
    open: false,
    player: null,
  });
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const openDeleteDialog = (player) =>
    setDeleteDialogState({ open: true, player });
  const closeDeleteDialog = () =>
    setDeleteDialogState({ open: false, player: null });

  const openEditDialog = (player) => setEditDialogState({ open: true, player });
  const closeEditDialog = () =>
    setEditDialogState({ open: false, player: null });

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="w-full flex flex-row gap-6 justify-between">
        <InputGroup className="max-w-sm">
          <InputGroupInput
            placeholder="Suche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="secondary"
              onClick={() => setSearchTerm("")}
            >
              {searchTerm ? "Zurücksetzen" : "Suche"}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <Button variant="success" onClick={() => setNewDialogOpen(true)}>
          <PlusIcon /> Neuer Spieler
        </Button>
      </div>
      <Table>
        <TableCaption>Alle Spieler</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Geburtstag</TableHead>
            <TableHead>Geschlecht</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPlayers.map((player) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">{player.id}</TableCell>
              <TableCell className="font-medium">{player.name}</TableCell>
              <TableCell>{formatDate(player.birthday)}</TableCell>
              <TableCell>{player.gender || "-"}</TableCell>
              <TableCell>
                {player.playerTeams.map((pt) => pt.team.name).join(", ")}
              </TableCell>
              <TableCell className="text-right">
                <PlayerListDropdown
                  onDeleteClick={() => openDeleteDialog(player)}
                  onEditClick={() => openEditDialog(player)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PlayerDeleteDialog
        open={deleteDialogState.open}
        player={deleteDialogState.player}
        onClose={() => {
          setDeleteDialogState({ open: false, player: null });
          router.refresh();
        }}
      />
      <PlayerEditDialog
        open={editDialogState.open}
        player={editDialogState.player}
        teams={teams}
        onClose={() => {
          setEditDialogState({ open: false, player: null });
          router.refresh();
        }}
      />
      <PlayerNewDialog
        open={newDialogOpen}
        teams={teams}
        onClose={() => {
          setNewDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

export default PlayerTable;
