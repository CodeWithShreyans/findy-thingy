import TryButton from "@/components/try-button"

const Home = () => {
    return (
        <>
            <section className="flex flex-col gap-8 items-center justify-center h-screen font-bold text-center">
                <h1 className="text-7xl">
                    Find your stuff <br />
                    with just a{" "}
                    <span className="underline decoration-wavy">sentence</span>
                </h1>
                <TryButton />
            </section>
            <section className="flex flex-col gap-8 items-center justify-center h-screen font-bold text-center">
                <h1 className="text-7xl">
                    ever forgotten <br /> what an email said?
                </h1>
                <p className="text-muted-foreground text-2xl">
                    Have you ever had to spend hours of your valuable time going{" "}
                    <br />
                    through emails or files trying to find the one you want?
                </p>
            </section>
            <section className="flex flex-col gap-8 items-center justify-center h-screen font-bold text-center">
                <h1 className="text-7xl">find it with just a description</h1>
                <p className="text-muted-foreground text-2xl">
                    Findy Thingy will create summaries of all your emails and{" "}
                    <br />
                    help you find them later with just a short description.
                </p>
                <TryButton />
            </section>
        </>
    )
}

export default Home
