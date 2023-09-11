import { create } from "zustand"

interface Res {
    res: Array<{ subject: string; desc: string }>
}

interface SubmitState {
    submitState: "idle" | "loading"
}

export const useResStore = create<Res>(() => ({
    res: [],
}))

export const useSubmitStateStore = create<SubmitState>(() => ({
    submitState: "idle",
}))
