import React, { useEffect, useState } from 'react';
import { useRouteMatch, Link } from 'react-router-dom';
import {
  BsFillCaretLeftFill,
  BsFillCaretRightFill,
  BsArrowRight,
  BsArrowLeft,
} from 'react-icons/bs';
import { Header, RepositoryInfo, Issues, Pagination } from './styles';
import Logo from '../../assets/logo.svg';
import api from '../../services/api';

interface RepositoryParams {
  repository: string;
}

interface Repository {
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
}

interface Issue {
  title: string;
  id: number;
  html_url: string;
  user: {
    login: string;
  };
}

const Repository: React.FC = () => {
  const { params } = useRouteMatch<RepositoryParams>();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [page, setPage] = useState(0);
  const [issuesPaginated, setIssuesPaginated] = useState<Issue[]>([]);
  const [prevDisabled, setPrevDisabled] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(false);
  const limit = 5;

  useEffect(() => {
    api.get(`/repos/${params.repository}`).then((response) => {
      setRepository(response.data);
    });

    api.get(`/repos/${params.repository}/issues`).then((response) => {
      setIssues(response.data);
      setPage(1);
    });
  }, [params.repository]);

  useEffect(() => {
    if (page > 1) setPrevDisabled(true);
    if (page === 1) setPrevDisabled(false);

    const paginatedIssues = issues.slice(page * limit - limit, limit * page);
    const nextPaginatedIssues = issues.slice(
      (page + 1) * limit - limit,
      limit * (page + 1),
    );
    if (paginatedIssues.length > 0) {
      setNextDisabled(true);
      setIssuesPaginated(paginatedIssues);
    }
    if (nextPaginatedIssues.length === 0) {
      setNextDisabled(false);
    }
  }, [page]);

  function prevPage(): void {
    setPage(page - 1);
  }

  function nextPage(): void {
    setPage(page + 1);
  }

  return (
    <>
      <Header>
        <img src={Logo} alt="GitHub Explorer" />
        <Link to="/">
          <BsFillCaretLeftFill />
          Voltar
        </Link>
      </Header>

      {repository && (
        <RepositoryInfo>
          <header>
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
            />
            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>
          </header>
          <ul>
            <li>
              <strong>{repository.stargazers_count}</strong>
              <span>Star</span>
            </li>
            <li>
              <strong>{repository.forks_count}</strong>
              <span>Forks</span>
            </li>
            <li>
              <strong>{repository.open_issues_count}</strong>
              <span>Issues abertas</span>
            </li>
          </ul>
        </RepositoryInfo>
      )}

      <Issues>
        {issuesPaginated.map((issue) => (
          <a key={issue.id} href={issue.html_url}>
            <div>
              <strong>{issue.title}</strong>
              <p>{issue.user.login}</p>
            </div>
            <BsFillCaretRightFill size={20} />
          </a>
        ))}
      </Issues>
      <Pagination>
        {prevDisabled && <BsArrowLeft size={20} onClick={prevPage} />}
        <span>{page}</span>
        {nextDisabled && <BsArrowRight size={20} onClick={nextPage} />}
      </Pagination>
    </>
  );
};

export default Repository;
