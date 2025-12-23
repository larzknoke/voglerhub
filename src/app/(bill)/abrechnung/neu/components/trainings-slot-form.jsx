import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircleIcon, PlusIcon, PlusSquareIcon } from "lucide-react";

function TrainingSlotFormComp({
  trainingSlotForm,
  addTrainingSlot,
  open,
  setOpen,
}) {
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="success" size={"icon"}>
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trainingszeiten hinzufügen</DialogTitle>
          </DialogHeader>
          <Form {...trainingSlotForm}>
            <form
              onSubmit={trainingSlotForm.handleSubmit(addTrainingSlot)}
              className="space-y-6"
            >
              <div className="grid grid-cols-12 gap-4">
                <FormField
                  control={trainingSlotForm.control}
                  name="weekday"
                  render={({ field }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Wochentag</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Wochentag auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Montag</SelectItem>
                            <SelectItem value="2">Dienstag</SelectItem>
                            <SelectItem value="3">Mittwoch</SelectItem>
                            <SelectItem value="4">Donnerstag</SelectItem>
                            <SelectItem value="5">Freitag</SelectItem>
                            <SelectItem value="6">Samstag</SelectItem>
                            <SelectItem value="0">Sonntag</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={trainingSlotForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Ort</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Ort auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bbs">BBS Halle</SelectItem>
                            <SelectItem value="liebig">Liebighalle</SelectItem>
                            <SelectItem value="billerbeck">
                              Billerbeckhalle
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={trainingSlotForm.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Startzeit</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={trainingSlotForm.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Endzeit</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" variant="success">
                Speichern
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TrainingSlotFormComp;
