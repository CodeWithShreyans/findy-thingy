import { create } from "zustand"

interface Res {
    res: Array<{ subject: string; desc: string }>
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

export const useSubmitStateStore = create<SubmitState>(() => ({
    submitState: "idle",
}))

export const useDialogStateStore = create<DialogState>(() => ({
    dialogState: false,
}))
