"use client";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parkingSpotSchema, ParkingSpotFormData } from "./parkingSpotSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { DayOfWeek, ParkingFeature, VehicleType } from "@/types/definitions";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import MapInAdminPage from "./mapInAdminPage";
import CreateFormSkeleton from "../skeletons";

export default function EditParkingSpotForm({
  parkingSpotId,
}: {
  parkingSpotId: string;
}) {
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ParkingSpotFormData>({
    resolver: zodResolver(parkingSpotSchema),
    defaultValues: {
      name: "",
      address: "",
      postcode: "",
      description: "",
      ratePerHour: "0",
      ratePerDay: "0",
      features: [],
      availabilities: [{ day: "MON", startTime: "", endTime: "" }],
      vehiclesCapacity: [{ vehicleType: "SMALL", capacity: 1 }],
    },
  });
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState<null | string>(null);

  const setLocation = (latitude: number, longitude: number) => {
    setValue("latitude", latitude);
    setValue("longitude", longitude);
  };

  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const features = useWatch({ control, name: "features" });
  const availabilities = useWatch({ control, name: "availabilities" });
  const vehiclesCapacity = useWatch({ control, name: "vehiclesCapacity" });

  const {
    fields: availabilityFields,
    append: appendAvailability,
    remove: removeAvailability,
  } = useFieldArray({
    control,
    name: "availabilities",
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: "features",
  });

  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({
    control,
    name: "vehiclesCapacity",
  });

  // Fetch parking spot data
  useEffect(() => {
    const fetchParkingSpot = async () => {
      try {
        const res = await axiosInstance.get(
          `/admin/parking-spot-app/parking-spots/${parkingSpotId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (res.status === 200) {
          const data = res.data;
          reset(data); // Populate form with fetched data
          setPreviewImage(data.coverImage);
          setLoading(false);
        }
      } catch (error) {
        console.log("Error fetching parking spot data:", error);
        setLoading(false);
      }
    };

    fetchParkingSpot();
  }, [parkingSpotId, setValue, reset]);

  console.log(errors);

  const onSubmit = async (data: ParkingSpotFormData) => {
    const formData = new FormData();

    const urlToFile = async (url: string, filename: string) => {
      const res = await fetch(url, { mode: "no-cors" });
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type });
    };

    Object.entries(data).forEach(async ([key, value]) => {
      if (key === "coverImage" && typeof value === "string") {
        const file = await urlToFile(value, "coverImage.jpg");
        formData.append(key, file);
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          Object.entries(item).forEach(([itemKey, itemValue]) => {
            formData.append(
              `${key}[${index}][${itemKey}]`,
              itemValue as string
            );
          });
        });
      } else {
        formData.append(key, value as string);
      }
    });

    try {
      const res = await axiosInstance.patch(
        `/admin/parking-spot-app/parking-spots/${parkingSpotId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
        router.push("/admin/parking-spots");
      }
    } catch (error) {
      console.log("Error updating parking spot:", error);
      toast.error("Failed to update parking spot.");
    }
  };

  const Delete = async (url: string) => {
    try {
      await axiosInstance.delete(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
    } catch (error) {
      console.log("Error deleting parking spot:", error);
    }
  };

  const deleteAvailability = (id: number) => {
    Delete(`/admin/parking-spot-app/availability/${id}/delete/`);
  };

  const deleteFeature = async (id: number) => {
    Delete(`/admin/parking-spot-app/features/${id}/delete/`);
  };

  const deleteVehicleCapacity = async (id: number) => {
    Delete(`/admin/parking-spot-app/vehicle-capacity/${id}/delete/`);
  };

  if (loading) {
    return <CreateFormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-10 py-8">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-mont-semibold">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="font-mont-medium" htmlFor="name">
                    Name
                  </Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-mont-medium" htmlFor="address">
                    Address
                  </Label>
                  <Input id="address" {...register("address")} />
                  {errors.address && (
                    <p className="text-red-500 text-sm">
                      {errors.address.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-mont-medium" htmlFor="postcode">
                    Postcode
                  </Label>
                  <Input id="postcode" {...register("postcode")} />
                  {errors.postcode && (
                    <p className="text-red-500 text-sm">
                      {errors.postcode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mont-medium" htmlFor="coverImage">
                  Cover Image
                </Label>
                {/* Display the fetched cover image if available */}
                {previewImage && (
                  <div className="relative w-full h-48">
                    <Image
                      layout="fill"
                      src={previewImage as string}
                      alt="Cover"
                      className="object-cover w-full h-full rounded-md"
                    />
                  </div>
                )}
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue("coverImage", file);
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                />
                {errors.coverImage && (
                  <p className="text-red-500 text-sm">
                    {errors.coverImage.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mont-medium" htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                rows={5}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-mont-medium">Location</Label>
              <MapInAdminPage
                latitude={latitude ?? 0}
                longitude={longitude ?? 0}
                setLocation={setLocation}
              />
              {latitude && longitude ? (
                <p>
                  <span className="font-mont-medium text-sm">Latitude</span>:{" "}
                  {latitude},{" "}
                  <span className="font-mont-medium text-sm">Longitude</span>:{" "}
                  {longitude}
                </p>
              ) : (
                <p>Fetching location...</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-mont-bold">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-mont-medium" htmlFor="ratePerHour">
                  Rate per Hour
                </Label>
                <Input id="ratePerHour" {...register("ratePerHour")} />
                {errors.ratePerHour && (
                  <p className="text-red-500 text-sm">
                    {errors.ratePerHour.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-mont-medium" htmlFor="ratePerDay">
                  Rate per Day
                </Label>
                <Input id="ratePerDay" {...register("ratePerDay")} />
                {errors.ratePerDay && (
                  <p className="text-red-500 text-sm">
                    {errors.ratePerDay.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-mont-bold">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(ParkingFeature).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={featureFields.some((f) => f.feature === key)}
                    onCheckedChange={(checked) => {
                      const feat = features.find((f) => f.feature === key);
                      if (feat?.id) {
                        deleteFeature(feat.id);
                      }
                      if (checked) {
                        appendFeature({
                          feature: key as keyof typeof ParkingFeature,
                        });
                      } else {
                        const index = featureFields.findIndex(
                          (f) => f.feature === key
                        );
                        if (index !== -1) {
                          removeFeature(index);
                        }
                      }
                    }}
                  />
                  <Label className="font-mont-medium" htmlFor={key}>
                    {value}
                  </Label>
                </div>
              ))}
            </div>
            {errors.features && (
              <p className="text-red-500 text-sm">
                Duplicate features found: {errors?.features?.root?.message}{" "}
              </p>
            )}
          </div>

          <Separator />

          {/* Availabilities */}
          <div className="space-y-4">
            <h3 className="text-lg font-mont-bold">Availabilities</h3>
            {availabilityFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
              >
                <div className="space-y-2">
                  <Label
                    className="font-mont-medium"
                    htmlFor={`availabilities.${index}.day`}
                  >
                    Day
                  </Label>
                  <Controller
                    name={`availabilities.${index}.day`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(DayOfWeek).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className="font-mont-medium"
                    htmlFor={`availabilities.${index}.startTime`}
                  >
                    Start Time
                  </Label>
                  <Input
                    id={`availabilities.${index}.startTime`}
                    type="time"
                    {...register(`availabilities.${index}.startTime`)}
                  />
                  {errors.availabilities && (
                    <p className="text-red-500 text-sm">
                      {errors?.availabilities?.[index]?.startTime?.message ??
                        ""}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    className="font-mont-medium"
                    htmlFor={`availabilities.${index}.endTime`}
                  >
                    End Time
                  </Label>
                  <Input
                    id={`availabilities.${index}.endTime`}
                    type="time"
                    {...register(`availabilities.${index}.endTime`)}
                  />
                  {errors.availabilities && (
                    <p className="text-red-500 text-sm">
                      {errors?.availabilities?.[index]?.endTime?.message ?? ""}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      const availability = availabilities[index];
                      if (availability?.id) {
                        deleteAvailability(availability.id);
                      }
                      removeAvailability(index);
                    }}
                    disabled={availabilityFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              className="font-mont-medium text-white"
              type="button"
              onClick={() =>
                appendAvailability({
                  day: "MON",
                  startTime: "",
                  endTime: "",
                })
              }
            >
              Add More Availability
            </Button>
            {errors.availabilities && (
              <p className="text-red-500 text-sm">
                {errors?.availabilities?.root?.message}
              </p>
            )}
          </div>

          <Separator />

          {/* Vehicles Capacity */}
          <div className="space-y-4">
            <h3 className="text-lg font-mont-bold">Vehicles Capacity</h3>
            {vehicleFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              >
                <div className="space-y-2">
                  <Label
                    className="font-mont-medium"
                    htmlFor={`vehiclesCapacity.${index}.vehicleType`}
                  >
                    Vehicle Type
                  </Label>
                  <Controller
                    name={`vehiclesCapacity.${index}.vehicleType`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(VehicleType).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className="font-mont-medium"
                    htmlFor={`vehiclesCapacity.${index}.capacity`}
                  >
                    Capacity
                  </Label>
                  <Input
                    id={`vehiclesCapacity.${index}.capacity`}
                    type="number"
                    {...register(`vehiclesCapacity.${index}.capacity`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.vehiclesCapacity && (
                    <p className="text-red-500 text-sm">
                      {errors?.vehiclesCapacity?.[index]?.capacity?.message ??
                        ""}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      const vehicle = vehiclesCapacity[index];
                      if (vehicle?.id) {
                        deleteVehicleCapacity(vehicle.id);
                      }
                      removeVehicle(index);
                    }}
                    disabled={vehicleFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              className="font-mont-medium text-white"
              type="button"
              onClick={() => {
                appendVehicle({
                  vehicleType: "SMALL",
                  capacity: 1,
                });
              }}
            >
              Add More Vehicle Capacity
            </Button>
            {errors?.vehiclesCapacity && (
              <p className="text-red-500 text-sm">
                {errors?.vehiclesCapacity?.root?.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="font-mont-medium text-white" type="submit" size="lg">
          Update
        </Button>
      </div>
    </form>
  );
}
