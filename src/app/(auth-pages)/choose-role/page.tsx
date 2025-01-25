"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axiosInstance from "@/lib/axiosInstance"
import { redirect, useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import type React from "react"
import { useAuth } from "@/context/authContext"

const ChooseRolePage = () => {
    const [role, setRole] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const { user } = useAuth();

    // skip this page if user already has a role
    if (user?.roles) {
        return redirect("/")
    }

    const handleSaveRole = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await axiosInstance.post(
                "/auth/role",
                { role },
                {
                    headers: {
                        user_uuid: user?.id,
                    },
                },
            )

            if (res.status === 201) {
                return router.push("/");
            }
        } catch (error) {
            console.error("Failed to save role:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-mont-medium text-center">Choose Your Role</CardTitle>
                    <CardDescription className="text-center">
                        Select the role that best describes you in our platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveRole} className="space-y-6">
                        <RadioGroup name="role" value={role} onValueChange={setRole} className="space-y-4">
                            <div className="flex items-center space-x-4 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <RadioGroupItem value="owner" id="owner" />
                                <Label htmlFor="owner" className="flex-grow cursor-pointer">
                                    <div className="font-mont-semibold text-gray-500">Owner</div>
                                    <div className="text-sm text-gray-500">I own or manage parkings.</div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-4 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <RadioGroupItem value="driver" id="driver" />
                                <Label htmlFor="driver" className="flex-grow cursor-pointer">
                                    <div className="font-mont-semibold text-gray-500">Driver</div>
                                    <div className="text-sm text-gray-500">I usually search for parkings. </div>
                                </Label>
                            </div>
                        </RadioGroup>
                        <Button type="submit" className="w-full" disabled={!role || isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save and Continue"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ChooseRolePage

