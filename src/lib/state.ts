import { create } from "zustand"

interface Res {
    res: Array<{ subject: string; desc: string }>
}

interface Search {
    res: {
        to: string
        from: string
        date: string
        subject: string
        content: string
    } | null
}

interface SubmitState {
    submitState: "idle" | "loading"
}

interface DialogState {
    dialogState: boolean
}

export const useResStore = create<Res>(() => ({
    res: [],
}))

export const useSearchStore = create<Search>(() => ({ res: null }))

export const useSubmitStateStore = create<SubmitState>(() => ({
    submitState: "idle",
}))

export const useDialogStateStore = create<DialogState>(() => ({
    dialogState: false,
}))
