import { create } from "zustand"

export const useAiResStore = create(() => ({
    aiRes: "",
}))

export const useSubmitStateStore = create(() => ({
    submitState: "idle",
}))
