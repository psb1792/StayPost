import { supabase, invokeSupabaseFunction } from '../lib/supabase'

// Example 1: Direct Supabase client usage with automatic token handling
export async function exampleDirectUsage() {
  try {
    // The Supabase client automatically handles authentication tokens
    const { data, error } = await supabase.functions.invoke('generate-caption', {
      body: { 
        emotion: 'cozy',
        templateId: 'template-1'
      }
    })

    if (error) {
      console.error('Function invocation error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error:', err)
    return null
  }
}

// Example 2: Using the helper function for cleaner code
export async function exampleWithHelper(imageUrl: string) {
  try {
    const { data, error } = await invokeSupabaseFunction('generate-caption', {
      imageUrl,
      emotion: 'romantic',
      templateId: 'template-2'
    })

    if (error) {
      throw new Error(error.message || 'Failed to generate caption')
    }

    return data
  } catch (err) {
    console.error('Error:', err)
    return null
  }
}

// Example 3: Database operations with automatic token handling
export async function exampleDatabaseOperations() {
  try {
    // Database queries also benefit from automatic token handling
    const { data, error } = await supabase
      .from('processed_images')
      .select('*')
      .limit(10)

    if (error) {
      console.error('Database error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error:', err)
    return null
  }
}

// Example 4: Storage operations with automatic token handling
export async function exampleStorageOperations(file: File) {
  try {
    // File uploads also benefit from automatic token handling
    const { data, error } = await supabase.storage
      .from('processed-images')
      .upload(`example-${Date.now()}.jpg`, file)

    if (error) {
      console.error('Storage error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Unexpected error:', err)
    return null
  }
}

// Example 5: Real-world usage pattern
export async function generateStayPostContent(imageFile: File) {
  try {
    // Convert image to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64Data = result.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(imageFile)
    })

    // Use Supabase client with automatic token handling
    const { data, error } = await invokeSupabaseFunction('generate-image-meta', {
      imageBase64: base64
    })

    if (error) {
      throw new Error(error.message || 'Failed to generate image meta')
    }

    if (!data) {
      throw new Error('No data received from the server')
    }

    return data
  } catch (err) {
    console.error('Error generating content:', err)
    return null
  }
} 