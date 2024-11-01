# rebar-atm

> [!IMPORTANT]
> This plugin requires some dependencies, make sure you have installed them first.

This is rebar-atm! A simple plugin which provides a banking system for a server using the Rebar Framework by Stuyk

## How to install?

1. Clone these repositories into your Rebar alt:V server `main` directory.

```bash
cd /path/to/your/rebar-altv/
git clone https://github.com/Stuyk/rebar-currency.git src/plugins/currency
git clone https://github.com/ASCENDED-Team/asc-notifications.git src/plugins/asc-notifications
```

2. Now also clone this repository into your Rebar `main` directory
```bash
git clone https://github.com/dorn3r/rebar-atm.git src/plugins/rebar-atm
```

3. Got it? Ok now you're ready to go. They'll load automatically once you start the server.

## Config

Currently there is just one config which you can change. But im sure it can be customized if you modify the `config.ts` file.

```typescript
export const = atmConfig = {
   Settings: {
      showAtmBlips: true, // set to false if you dont want to show the blips
   }
}
```

## Dependencies

- [Rebar Currency](https://github.com/Stuyk/rebar-currency/)
- [Ascended Notifications](https://github.com/ASCENDED-Team/asc-notifications/)