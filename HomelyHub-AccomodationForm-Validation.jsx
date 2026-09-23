import React, { useState } from "react";
import ImagesUploading from "./ImagesUploading";
import { getAiDescription } from "../../ai/aiDescription";
import { useForm } from "@tanstack/react-form";
import { AddressField } from "./AddressField";
import AmenitiesField from "./AmenitiesField";
import {
  createAccomodation,
  getAllAccomodation,
} from "../../store/Accomodation/Accomodation-action";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Section = ({ icon, title, hint, children }) => (
  <section className="accf-card">
    <div className="accf-sec">
      <span className="material-symbols-outlined">{icon}</span>
      <h2>{title}</h2>
      {hint && <span className="accf-hint">{hint}</span>}
    </div>
    {children}
  </section>
);

const AccomodationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.accomodation);

  const [aiLoading, setAiLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      propertyType: undefined,
      roomType: undefined,
      extraInfo: undefined,
      images: [],
      amenities: [],
      address: {
        area: "",
        city: "",
        state: "",
        pincode: "",
      },
      checkIn: undefined,
      checkOut: undefined,
      maximumGuest: 0,
      price: "",
    },

    onSubmit: async ({ value }) => {
      try {
        // -----------------------------
        // Client-side validation
        // -----------------------------

        if (!value.name?.trim()) {
          toast.error("Please enter a property name");
          return;
        }

        if (!value.propertyType) {
          toast.error("Please select a property type");
          return;
        }

        if (!value.roomType) {
          toast.error("Please select a room type");
          return;
        }

        if (
          !value.address?.area?.trim() ||
          !value.address?.city?.trim() ||
          !value.address?.state?.trim() ||
          !value.address?.pincode?.trim()
        ) {
          toast.error("Please complete the address details");
          return;
        }

        if (!value.images || value.images.length < 6) {
          toast.error("Please upload at least 6 images");
          return;
        }

        if (!value.description?.trim()) {
          toast.error("Please add a property description");
          return;
        }

        if (!value.checkIn) {
          toast.error("Please select check-in time");
          return;
        }

        if (!value.checkOut) {
          toast.error("Please select check-out time");
          return;
        }

        if (
          value.maximumGuest === "" ||
          Number(value.maximumGuest) < 1
        ) {
          toast.error("Guests must be at least 1");
          return;
        }

        if (
          value.price === "" ||
          Number(value.price) <= 0
        ) {
          toast.error("Price must be greater than 0");
          return;
        }

        // -----------------------------
        // Validated data
        // -----------------------------

        console.log("Validated accommodation data:", value);

        await dispatch(
          createAccomodation({
            propertyName: value.name,
            description: value.description,
            propertyType: value.propertyType,
            roomType: value.roomType,
            extraInfo: value.extraInfo,
            images: value.images,
            address: value.address,
            amenities: value.amenities,
            checkInTime: value.checkIn,
            checkOutTime: value.checkOut,
            maximumGuest: Number(value.maximumGuest),
            price: Number(value.price),
          })
        );

        await dispatch(getAllAccomodation());

        toast.success("New Property Created Successfully");

        navigate("/accomodation");
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to create property"
        );

        console.error(error);
      }
    },
  });

  const handleAiDescription = async (field) => {
    const values = form.state.values;

    if (!values.name) {
      toast.error("Please add a title first");
      return;
    }

    setAiLoading(true);

    try {
      const description = await getAiDescription(values);

      field.handleChange(description);

      toast.success("Description added");
    } catch (error) {
      toast.error("Could not generate a description");

      console.error(error);
    }

    setAiLoading(false);
  };

  return (
    <div className="accf-page">
      <header className="accf-hero">
        <h1>
          <span className="material-symbols-outlined">
            home_work
          </span>
          List your place
        </h1>

        <p>Fill in the details below</p>
      </header>

      <form
        className="accf-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {/* Title */}
        <Section
          icon="title"
          title="Title"
          hint="Short and catchy"
        >
          <form.Field name="name">
            {(field) => (
              <input
                className="accf-input"
                type="text"
                placeholder="Sunny cottage near the beach"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value)
                }
              />
            )}
          </form.Field>
        </Section>

        {/* Address */}
        <Section icon="location_on" title="Address">
          <AddressField form={form} />
        </Section>

        {/* Photos */}
        <Section
          icon="photo_library"
          title="Photos"
          hint="At least 6"
        >
          <form.Field name="images">
            {(field) => (
              <ImagesUploading field={field} />
            )}
          </form.Field>
        </Section>

        {/* Property */}
        <Section icon="home" title="Property">
          <div className="accf-grid-2">
            <div className="accf-field">
              <label>Property type</label>

              <form.Field name="propertyType">
                {(field) => (
                  <select
                    className="accf-input"
                    value={field.state.value || ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select
                    </option>

                    <option value="House">
                      House
                    </option>

                    <option value="Flat">
                      Flat
                    </option>

                    <option value="Guest House">
                      Guest House
                    </option>

                    <option value="Hotel">
                      Hotel
                    </option>
                  </select>
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Room type</label>

              <form.Field name="roomType">
                {(field) => (
                  <select
                    className="accf-input"
                    value={field.state.value || ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select
                    </option>

                    <option value="Anytype">
                      Anytype
                    </option>

                    <option value="Entire Home">
                      Entire Home
                    </option>

                    <option value="Room">
                      Room
                    </option>
                  </select>
                )}
              </form.Field>
            </div>
          </div>
        </Section>

        {/* Amenities */}
        <Section
          icon="checklist"
          title="Amenities"
          hint="Pick what you offer"
        >
          <AmenitiesField form={form} />
        </Section>

        {/* House Rules */}
        <Section
          icon="gavel"
          title="House rules"
          hint="Optional"
        >
          <form.Field name="extraInfo">
            {(field) => (
              <textarea
                className="accf-input accf-textarea"
                rows="3"
                placeholder="Check-in after 1pm, no smoking indoors..."
                value={field.state.value || ""}
                onChange={(e) =>
                  field.handleChange(e.target.value)
                }
              />
            )}
          </form.Field>
        </Section>

        {/* Description */}
        <Section icon="description" title="Description">
          <form.Field name="description">
            {(field) => (
              <>
                <div className="accf-desc-row">
                  <span className="accf-hint">
                    Tell guests what makes your place special
                  </span>

                  <button
                    type="button"
                    className="accf-ai"
                    disabled={aiLoading}
                    onClick={() =>
                      handleAiDescription(field)
                    }
                  >
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>

                    {aiLoading
                      ? "Writing..."
                      : "Write with AI"}
                  </button>
                </div>

                <textarea
                  className="accf-input accf-textarea"
                  rows="5"
                  placeholder="Write a few lines, or let AI do it for you"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value)
                  }
                />
              </>
            )}
          </form.Field>
        </Section>

        {/* Stay Details */}
        <Section
          icon="event"
          title="Stay details"
          hint="24 hour format"
        >
          <div className="accf-grid-4">
            {/* Check-in */}
            <div className="accf-field">
              <label>Check-in</label>

              <form.Field name="checkIn">
                {(field) => (
                  <input
                    className="accf-input"
                    type="time"
                    value={field.state.value || ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </div>

            {/* Check-out */}
            <div className="accf-field">
              <label>Check-out</label>

              <form.Field name="checkOut">
                {(field) => (
                  <input
                    className="accf-input"
                    type="time"
                    value={field.state.value || ""}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </div>

            {/* Guests */}
            <div className="accf-field">
              <label>Guests</label>

              <form.Field name="maximumGuest">
                {(field) => (
                  <input
                    className="accf-input"
                    type="number"
                    min="1"
                    placeholder="2"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </div>

            {/* Price */}
            <div className="accf-field">
              <label>Price / night</label>

              <form.Field name="price">
                {(field) => (
                  <input
                    className="accf-input"
                    type="number"
                    min="1"
                    placeholder="2000"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value)
                    }
                  />
                )}
              </form.Field>
            </div>
          </div>
        </Section>

        {/* Submit */}
        <button
          className="accf-save"
          type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : "Publish listing"}
        </button>
      </form>
    </div>
  );
};

export default AccomodationForm;