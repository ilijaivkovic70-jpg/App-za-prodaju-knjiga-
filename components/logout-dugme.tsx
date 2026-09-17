import { Button } from "@/components/ui/button";
import { odjaviSe } from "@/lib/auth/actions";

export function LogoutDugme() {
  return (
    <form action={odjaviSe}>
      <Button type="submit" variant="outline" size="sm">
        Odjavi se
      </Button>
    </form>
  );
}
