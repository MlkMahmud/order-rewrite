import React, { useEffect, useState } from "react";
import { Field, Form, useForm } from "react-final-form";
import { date, object, Schema, string, ValidationError } from "yup";
import ConditionalField from "./ConditionalField";
import "./styles.css";

interface User {
  dob: string;
  firstName: string;
  lastName: string;
  middleName: string;
};

interface InputProps {
  label: string;
  name: string;
  type: "date" | "text" | "number";
}

function Input({ label, name, type }: InputProps) {
  const form = useForm();

  useEffect(() => {
    if (form.mutators.setFieldVisibilityStatus) {
      console.log("RANNN");
      form.mutators.setFieldVisibilityStatus(name, true);
      
      return () => {
        form.mutators.setFieldVisibilityStatus(name, false);
      }
    }
  })

  return (
    <Field
      name={name}
      type={type}
    >
      {({ input, meta }) => (
        <>
          <label htmlFor={name}>
            <b>{label}:</b>
          </label>
          <input {...input} id={name} />
          {meta.touched && meta.error && (
            <span style={{ color: "red" }}>{meta.error}</span>
          )}
        </>
      )}
    </Field>
  );
}

const userSchema = object<User>({
  dob: date()
    .max("2005-01-01", "date must be earlier than 2005-01-01.")
    .min("1994-01-01", "date must be later than 1994-01-01.")
    .required("must be a valid date."),
  firstName: string().required("This field is required."),
  lastName: string().when("firstName", {
    is: (value: string) => {
      return ["Malik", "Mahmud"].includes(value);
    },
    then: () => string().required("Required."),
    otherwise: () => string().optional()
  }),
  middleName: string().optional(),
});

function makeValidate(schema: Schema) {
  return async (values: User) => {
    try {
      await schema.validate(values, { abortEarly: false });
    } catch (err) {
      const errors: Record<
        string,
        string
      > = (err as ValidationError).inner.reduce((acc, curr) => {
        return { ...acc, [curr.path as string]: curr.message };
      }, {});
      return errors;
    }
  };
}

function useValidate(schema: Schema) {
  const validate = React.useMemo(() => makeValidate(schema), [schema]);
  return validate;
}

export default function App() {
  const validate = useValidate(userSchema);
  return (
    <div className="App">
      <Form
        initialValues={{ dob: "", firstName: "", lastName: "" }}
        mutators={{
          setFieldVisibilityStatus: ([fieldName, isVisible], state, { setIn }) => {
            if (state.fields[fieldName]?.data) {
              console.log(fieldName, isVisible)
              setIn(
                state.fields[fieldName].data,
                "isVisible",
                isVisible
              );
              console.log(state.fields[fieldName]?.data)
            }
          }
        }}
        onSubmit={(values) => {
          alert(JSON.stringify(values, null, 2));
        }}
        validate={validate}
      >
        {({ handleSubmit, form }) => {
          return (
            <form onSubmit={handleSubmit}>
              <div>
                <Input
                  label="First Name"
                  name="firstName"
                  type="text"
                />
                <br />
                <ConditionalField
                  when="firstName"
                  value="Malik"
                >
                  <Input
                    label="Last Name"
                    name="lastName"
                    type="text"
                  />
                </ConditionalField>
                <br />
                <Input
                  label="Date of Birth"
                  name="dob"
                  type="date"
                />
                <br />
                <ConditionalField
                  when="lastName"
                  value="Mahmud"
                >
                  <Input
                    label="Middle Name"
                    name="middleName"
                    type="text"
                  />
                </ConditionalField>
              </div>
              <button type="submit">Submit</button>
              <button onClick={() => {
                form.mutators.setFieldVisibilityStatus("firstName", true);
              }} type="button">Trigger</button>
            </form>
          );
        }}
      </Form>
    </div>
  );
}
