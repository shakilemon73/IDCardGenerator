import { useQuery, useMutation } from "@tanstack/react-query";
import { Setting } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Hook to fetch all settings
export function useSettings(category?: string) {
  return useQuery<Setting[]>({
    queryKey: ["/api/settings", ...(category ? [{ category }] : [])],
    enabled: true,
  });
}

// Hook to fetch a specific setting by key
export function useSetting(key: string) {
  return useQuery<Setting>({
    queryKey: ["/api/settings", key],
    enabled: !!key,
  });
}

// Hook to create/update a setting
export function useUpdateSetting() {
  return useMutation({
    mutationFn: async (setting: { key: string; value: any; category?: string }) => {
      const response = await apiRequest("POST", "/api/settings", setting);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings", variables.key] });
      if (variables.category) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/settings", { category: variables.category }] 
        });
      }
    },
  });
}

// Hook to get school settings with defaults
export function useSchoolSettings() {
  const { data: settings, ...rest } = useSettings("school");
  
  // Convert settings array to object for easier access
  const settingsObject = settings?.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, any>) || {};

  return {
    settings: {
      schoolNameEnglish: settingsObject.school_name_english || "School Name",
      schoolNameBengali: settingsObject.school_name_bengali || "স্কুলের নাম",
      validTill: settingsObject.valid_till || "Dec 2024",
      academicYear: settingsObject.academic_year || new Date().getFullYear().toString(),
      sessionYear: settingsObject.session_year || new Date().getFullYear().toString(),
      address: settingsObject.address || "",
      phone: settingsObject.phone || "",
      email: settingsObject.email || "",
      website: settingsObject.website || "",
    },
    ...rest
  };
}

// Hook to bulk update school settings
export function useBulkUpdateSchoolSettings() {
  const updateSetting = useUpdateSetting();
  
  return useMutation({
    mutationFn: async (settings: {
      schoolNameEnglish?: string;
      schoolNameBengali?: string;
      validTill?: string;
      academicYear?: string;
      sessionYear?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
    }) => {
      const promises = [];
      
      if (settings.schoolNameEnglish !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "school_name_english",
          value: settings.schoolNameEnglish,
          category: "school"
        }));
      }
      
      if (settings.schoolNameBengali !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "school_name_bengali",
          value: settings.schoolNameBengali,
          category: "school"
        }));
      }
      
      if (settings.validTill !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "valid_till",
          value: settings.validTill,
          category: "school"
        }));
      }
      
      if (settings.academicYear !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "academic_year",
          value: settings.academicYear,
          category: "school"
        }));
      }
      
      if (settings.sessionYear !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "session_year",
          value: settings.sessionYear,
          category: "school"
        }));
      }
      
      if (settings.address !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "address",
          value: settings.address,
          category: "school"
        }));
      }
      
      if (settings.phone !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "phone",
          value: settings.phone,
          category: "school"
        }));
      }
      
      if (settings.email !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "email",
          value: settings.email,
          category: "school"
        }));
      }
      
      if (settings.website !== undefined) {
        promises.push(updateSetting.mutateAsync({
          key: "website",
          value: settings.website,
          category: "school"
        }));
      }
      
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });
}