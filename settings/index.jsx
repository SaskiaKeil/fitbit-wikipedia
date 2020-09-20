const languages = [
    {name: "Deutsch", value: "de"},
    {name: "English", value: "en"},
    {name: "Español", value: "es"},
    {name: "Français", value: "fr"},
    {name: "Italiano", value: "it"},
    {name: "Português", value: "pt"},
    {name: "Russian", value: "ru"},
];

function mySettings(props) {
  return (
    <Select
      settingsKey="language"
      label="Language"
      options={languages}
    />
  );
}

registerSettingsPage(mySettings);
