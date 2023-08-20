import { Button } from "./button"

const NavBar = () => {
    return (
        <nav className="basis-[3%] flex flex-col p-3 bg-muted gap-4">
            <Button variant={"ghost"} className="hover:bg-primary/10">
                F
            </Button>
            <Button variant={"ghost"} className="hover:bg-primary/10">
                F
            </Button>
            <Button variant={"ghost"} className="hover:bg-primary/10">
                F
            </Button>
            <Button variant={"ghost"} className="hover:bg-primary/10">
                F
            </Button>
            <Button variant={"ghost"} className="hover:bg-primary/10">
                F
            </Button>
        </nav>
    )
}
export default NavBar
