# ScrumEstimator

ScrumEstimator is a tool for scrum teams to estimate effort for stories in a "Planning Poker" style.

- [ScrumEstimator](#scrumestimator)
  - [Architecture](#architecture)
    - [Components](#components)
      - [Page](#page)
        - [Location in project](#location-in-project)
        - [Naming Conventions](#naming-conventions)
      - [Shared](#shared)
        - [Location in project](#location-in-project-1)
        - [Naming Conventions](#naming-conventions-1)
    - [Services](#services)
  - [Angular](#angular)
    - [Development server](#development-server)
    - [Code scaffolding](#code-scaffolding)
    - [Build](#build)
    - [Running unit tests](#running-unit-tests)
    - [Running end-to-end tests](#running-end-to-end-tests)
    - [Further help](#further-help)

---

## Architecture

### Components

Components will have two categories, `page` or `shared`

#### Page

A `page` represents a component that houses an entire feature set. Pages should be built using as many `shared` components as possible.

- Pages should act as a container or view of sub components an functionality
- Pages should not define any business logic themselves, all business logic should be defined in either a shared component or a service.

##### Location in project

Pages should be located in the following location in the project folder structure:

```
src
└── app
  └── page
```

##### Naming Conventions

Pages should be named using the following convention:

`<page-name>.page.component.<file-ext>`

Examples:

- `home.page.component.ts`
- `home.page.component.html`
- `home.page.component.spec.ts`

#### Shared

Shared components are the building blocks of the application. These are components that are designed for reuse throughout the application.

##### Location in project

Shared components should be located in the following location in the project folder structure:

```
src
└── app
  └── shared
```

##### Naming Conventions

Shared components should be named using the standard angular component convention:

`<component-name>.component.<file-ext>`

Examples:

- `card.component.ts`
- `card.component.html`
- `card.component.spec.ts`

### Services

---

## Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.0.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
