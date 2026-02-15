
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessListing, Review } from "../types";

/**
 * Audit service for analyzing business listings and generating automated responses.
 * Follows the latest @google/genai guidelines for initialization and usage.
 */

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const isQuotaError = (error: any): boolean => {
  const msg = error?.message?.toLowerCase() || "";
  const status = error?.status?.toLowerCase() || "";
  const code = error?.code || error?.status_code;
  return (
    msg.includes('quota') || 
    msg.includes('429') || 
    msg.includes('resource_exhausted') ||
    status.includes('resource_exhausted') ||
    code === 429
  );
};

export const analyzeBusinessPerformance = async (business: BusinessListing) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this Google Maps business listing data and provide a concise summary of its status and any recommended actions. 
      Business Name: ${business.name}
      Current Rating: ${business.rating}
      Recent Changes: ${business.changes.join(', ') || 'None'}
      Status: ${business.status}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    if (isQuotaError(error)) {
      throw new Error("QUOTA_EXCEEDED");
    }
    return "Unable to perform AI analysis at this time.";
  }
};

export const generateReviewResponse = async (review: Review, businessName: string) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a professional, empathetic, and personalized response to this Google Maps review for "${businessName}".
      Review Author: ${review.author}
      Rating: ${review.rating} stars
      Review Text: "${review.text}"
      
      Response requirements:
      - If negative, apologize and offer a way to make it right.
      - If positive, express gratitude and invite them back.
      - Keep it under 100 words.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini Review Response Error:", error);
    if (isQuotaError(error)) {
      throw new Error("QUOTA_EXCEEDED");
    }
    return "Thank you for your feedback. We appreciate your input.";
  }
};

export const getSentimentAnalysis = async (reviews: Review[]) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the sentiment and key themes from these business reviews: ${reviews.map(r => `[${r.rating} stars: ${r.text}]`).join('; ')}. 
      Return a JSON object with:
      - overallSentiment: string (one word)
      - keyPainPoints: string[]
      - positiveHighlights: string[]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSentiment: {
              type: Type.STRING,
              description: 'The overall mood of the customer feedback.',
            },
            keyPainPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific issues mentioned by multiple customers.',
            },
            positiveHighlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Positive aspects praised in the reviews.',
            },
          },
          required: ["overallSentiment", "keyPainPoints", "positiveHighlights"],
          propertyOrdering: ["overallSentiment", "keyPainPoints", "positiveHighlights"],
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    console.error("Gemini Sentiment Analysis Error:", error);
    if (isQuotaError(error)) {
      throw new Error("QUOTA_EXCEEDED");
    }
    return null;
  }
};

export const discoverNearbyBusinesses = async (location: { lat: number; lng: number } | null, query: string = "") => {
  try {
    const ai = getAIClient();
    const prompt = `Act as a local business scout. Discover 3 potential businesses to monitor in the San Francisco area (near lat: ${location?.lat || 37.77}, lng: ${location?.lng || -122.41}). ${query ? `Focus on businesses related to "${query}".` : ''} 
    Return an array of business objects in JSON format.
    
    Requirements:
    - name: string
    - address: string
    - phone: string
    - rating: number (between 3.0 and 5.0)
    - reviewCount: number
    - status: 'synced'
    - coordinates: { lat: number, lng: number }
    - hours: { monday: string, tuesday: string, ... } (standard 9-5 style)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              phone: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviewCount: { type: Type.NUMBER },
              status: { type: Type.STRING, enum: ['synced'] },
              coordinates: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                },
                required: ['lat', 'lng']
              },
              hours: {
                type: Type.OBJECT,
                properties: {
                  monday: { type: Type.STRING },
                  tuesday: { type: Type.STRING },
                  wednesday: { type: Type.STRING },
                  thursday: { type: Type.STRING },
                  friday: { type: Type.STRING },
                  saturday: { type: Type.STRING },
                  sunday: { type: Type.STRING }
                },
                required: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
              }
            },
            required: ['name', 'address', 'phone', 'rating', 'reviewCount', 'status', 'coordinates', 'hours']
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error: any) {
    console.error("Scanner Error:", error);
    if (isQuotaError(error)) {
      throw new Error("QUOTA_EXCEEDED");
    }
    return [];
  }
};

export const searchBusinessOnMaps = async (query: string) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Search for the business "${query}" on Google Maps. Return its official details. If multiple found, return the most prominent one.
      Return as JSON with:
      - name: string
      - address: string
      - phone: string
      - rating: number
      - reviewCount: number
      - coordinates: {lat: number, lng: number}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            address: { type: Type.STRING },
            phone: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            reviewCount: { type: Type.NUMBER },
            coordinates: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER }
              },
              required: ["lat", "lng"]
            }
          },
          required: ["name", "address", "phone", "rating", "reviewCount", "coordinates"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    console.error("Search Business Error:", error);
    if (isQuotaError(error)) {
      throw new Error("QUOTA_EXCEEDED");
    }
    return null;
  }
};
