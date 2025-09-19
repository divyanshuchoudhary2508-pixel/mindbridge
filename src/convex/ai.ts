"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const generateResponse = action({
  args: {
    message: v.string(),
    anonymousId: v.string(),
    chatHistory: v.array(v.object({
      message: v.string(),
      isUser: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Simple AI response logic - in production, integrate with OpenAI or similar
    const { message, chatHistory } = args;
    
    // Crisis detection keywords
    const crisisKeywords = [
      "suicide", "kill myself", "end it all", "hurt myself", 
      "self harm", "die", "death", "hopeless", "worthless"
    ];
    
    const isCrisis = crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    let response = "";
    
    if (isCrisis) {
      response = `I'm really concerned about what you're sharing. Your feelings are valid, but I want you to know that help is available right away. Please consider reaching out to a crisis helpline:

**National Suicide Prevention Lifeline: 988**
**Crisis Text Line: Text HOME to 741741**

You don't have to go through this alone. Would you like me to help you find local emergency resources, or would you prefer to talk about what's been making you feel this way?`;
    } else if (message.toLowerCase().includes("anxiety")) {
      response = "I understand you're dealing with anxiety. That can be really challenging. Some techniques that many people find helpful include deep breathing exercises, grounding techniques (like the 5-4-3-2-1 method), and mindfulness. Would you like me to guide you through a quick breathing exercise, or would you prefer to talk more about what's triggering your anxiety?";
    } else if (message.toLowerCase().includes("depression") || message.toLowerCase().includes("sad")) {
      response = "I hear that you're struggling with difficult feelings. Depression can make everything feel overwhelming. It's important to remember that these feelings, while very real and valid, can change with the right support. Have you been able to maintain any daily routines, or would you like some suggestions for small steps that might help?";
    } else if (message.toLowerCase().includes("stress")) {
      response = "Stress can really impact our daily lives. It sounds like you're dealing with a lot right now. Some effective stress management techniques include breaking tasks into smaller steps, taking regular breaks, and practicing relaxation techniques. What's been the biggest source of stress for you lately?";
    } else if (message.toLowerCase().includes("sleep") || message.toLowerCase().includes("insomnia")) {
      response = "Sleep issues can really affect our mental health. Good sleep hygiene includes keeping a consistent sleep schedule, avoiding screens before bed, and creating a calming bedtime routine. Have you noticed any patterns in what might be affecting your sleep?";
    } else {
      // General supportive response
      response = "Thank you for sharing that with me. I'm here to listen and support you. It takes courage to reach out and talk about what you're experiencing. Your feelings are valid, and you deserve support. Is there a particular aspect of what you're going through that you'd like to explore more, or would you like some suggestions for coping strategies?";
    }
    
    // Add the AI response to chat history
    // replaced duplicate internal addMessage call
    // Add the AI response to chat history
    await ctx.runMutation(api.chatbot.addMessage, {
      anonymousId: args.anonymousId,
      message: response,
      isUser: false,
    });
    
    return {
      response,
      isCrisis,
    };
  },
});