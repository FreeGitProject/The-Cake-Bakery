import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EventFormProps {
  eventStartDate: string
  eventEndDate: string
  setEventStartDate: (date: string) => void
  setEventEndDate: (date: string) => void
}

export function EventForm({ eventStartDate, eventEndDate, setEventStartDate, setEventEndDate }: EventFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="event-start-date">Event Start Date</Label>
        <Input
          id="event-start-date"
          type="date"
          value={eventStartDate}
          onChange={(e) => setEventStartDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="event-end-date">Event End Date</Label>
        <Input
          id="event-end-date"
          type="date"
          value={eventEndDate}
          onChange={(e) => setEventEndDate(e.target.value)}
          required
        />
      </div>
    </div>
  )
}

