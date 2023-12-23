import { HfInference } from "@huggingface/inference";

const inference = new HfInference(process.env.HF_ACCESS_TOKEN)

export async function getEmotionalAnalisis(text: string) {
    const response = await inference.textClassification({
        model: "SamLowe/roberta-base-go_emotions",
        inputs: text
    })

    return response
}