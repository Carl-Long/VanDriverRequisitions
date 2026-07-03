type WelcomeHeadingProps = {
    userName?: string | null;
};

export function WelcomeHeading({ userName }: Readonly<WelcomeHeadingProps>) {
    const firstName = userName?.split(" ")[0] || "User";

    return (
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome back, <span className="text-primary">{firstName}</span>
        </h1>
    );
}
