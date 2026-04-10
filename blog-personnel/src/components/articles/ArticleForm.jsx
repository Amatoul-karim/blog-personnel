import { useEffect, useState } from 'react';

const defaultValues = {
  title: '',
  content: '',
  isPublic: true,
  allowComments: true
};

function ArticleForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [formData, setFormData] = useState(defaultValues);

  useEffect(() => {
    setFormData(initialValues || defaultValues);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
    if (!initialValues) {
      setFormData(defaultValues);
    }
  };

  const isEditing = Boolean(initialValues?.id);

  return (
    <form className="article-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <h2>{isEditing ? 'Modifier un article' : 'Nouvel article'}</h2>
          <p>Ajoutez un titre, un contenu et vos options de visibilité.</p>
        </div>
      </div>

      <label>
        Titre
        <input
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          placeholder="Titre de votre article"
          required
        />
      </label>

      <label>
        Contenu
        <textarea
          name="content"
          rows="6"
          value={formData.content}
          onChange={handleChange}
          placeholder="Rédigez ici votre article…"
          required
        />
      </label>

      <div className="checkbox-row">
        <label className="checkbox-card">
          <input
            name="isPublic"
            type="checkbox"
            checked={formData.isPublic}
            onChange={handleChange}
          />
          <span>Article public</span>
        </label>

        <label className="checkbox-card">
          <input
            name="allowComments"
            type="checkbox"
            checked={formData.allowComments}
            onChange={handleChange}
          />
          <span>Commentaires autorisés</span>
        </label>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement…' : isEditing ? 'Mettre à jour' : 'Publier'}
        </button>
        {isEditing ? (
          <button className="btn btn-secondary" type="button" onClick={onCancel}>
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default ArticleForm;
