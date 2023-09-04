import { create } from "zustand"

export const useResStore = create(() => ({
    res: [{ subject: "", desc: "" }],
}))

export const useSubmitStateStore = create(() => ({
    submitState: "idle",
}))
